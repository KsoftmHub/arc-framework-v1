#!/usr/bin/env python3
"""smoke-test.py — exercise the ARC skill's Python scripts end-to-end.

Runs arc_init -> arc_new -> arc_status against a throwaway project and asserts
the expected files, ID increment, and status output. Keeps the agent-facing
tooling honest in CI. Zero third-party deps.
"""

import json
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS = ROOT / "skill" / "arc" / "scripts"


def run(*args):
    return subprocess.run([sys.executable, *map(str, args)],
                          capture_output=True, text=True, check=True)


def main() -> int:
    with tempfile.TemporaryDirectory() as tmp:
        proj = Path(tmp)

        run(SCRIPTS / "arc_init.py", proj, "--owner", "ci")
        for rel in ["ARC.md", ".arc/INDEX.md", ".arc/_TEMPLATE.md", ".arc/ARC-0000-maintenance.md"]:
            assert (proj / rel).exists(), f"missing {rel}"
        maint = (proj / ".arc/ARC-0000-maintenance.md").read_text()
        assert "owner: ci" in maint, "owner not stamped"
        assert "{{DATE}}" not in maint, "date placeholder left unsubstituted"

        # idempotency
        out = run(SCRIPTS / "arc_init.py", proj).stdout
        assert "skip" in out, "re-init should skip existing files"

        run(SCRIPTS / "arc_new.py", proj, "--title", "Add rate limiting", "--tags", "api,infra")
        assert (proj / ".arc/ARC-0001-add-rate-limiting.md").exists(), "ARC-0001 not created"
        index = (proj / ".arc/INDEX.md").read_text()
        assert "next_id: ARC-0002" in index, "next_id not incremented"
        assert "ARC-0001 | Add rate limiting" in index, "index row missing"

        run(SCRIPTS / "arc_new.py", proj, "--title", "Second thing")
        assert (proj / ".arc/ARC-0002-second-thing.md").exists(), "ARC-0002 not created"

        arcs = json.loads(run(SCRIPTS / "arc_status.py", proj, "--json").stdout)
        ids = {a["id"] for a in arcs}
        assert {"ARC-0000", "ARC-0001", "ARC-0002"} <= ids, f"unexpected ids: {ids}"

    print("smoke test passed ✔")
    return 0


if __name__ == "__main__":
    sys.exit(main())

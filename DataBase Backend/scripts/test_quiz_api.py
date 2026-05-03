"""
Smoke-test quiz HTTP endpoints against a running FastAPI server (default http://127.0.0.1:8000).

Authentication (pick one):
  1) Set env QUIZ_TEST_EMAIL and QUIZ_TEST_PASSWORD — script calls POST /api/v1/users/login.
  2) Set env QUIZ_TEST_TOKEN — use an existing Bearer JWT from Swagger or the app.

Usage:
    python scripts/test_quiz_api.py
    python scripts/test_quiz_api.py http://127.0.0.1:8000
"""
import asyncio
import os
import sys

import httpx

CH1 = "84ff48ce-5bd9-4ced-8ae0-852367061b36"
CH2 = "bf5f88c0-a7e1-4345-aaaa-973d9e65829c"


async def obtain_token(base: str) -> str:
    token = os.environ.get("QUIZ_TEST_TOKEN", "").strip()
    if token:
        return token
    email = os.environ.get("QUIZ_TEST_EMAIL", "").strip()
    password = os.environ.get("QUIZ_TEST_PASSWORD", "")
    if not email or not password:
        print(
            "ERROR: Set QUIZ_TEST_EMAIL + QUIZ_TEST_PASSWORD, or QUIZ_TEST_TOKEN, then re-run.\n"
            "  Example (PowerShell):\n"
            '    $env:QUIZ_TEST_EMAIL = "you@example.com"\n'
            '    $env:QUIZ_TEST_PASSWORD = "your-password"\n'
            "    python scripts/test_quiz_api.py\n"
        )
        sys.exit(1)
    async with httpx.AsyncClient(base_url=base, timeout=30.0) as client:
        r = await client.post(
            "/api/v1/users/login",
            json={"email": email, "password": password, "remember_me": False},
        )
        if r.status_code != 200:
            print(f"ERROR: login failed HTTP {r.status_code}: {r.text}")
            sys.exit(1)
        data = r.json()
        return data["token"]


async def main(base_url: str) -> None:
    base = base_url.rstrip("/")
    token = await obtain_token(base)
    headers = {"Authorization": f"Bearer {token}"}

    chapters = [("Chapter 1", CH1), ("Chapter 2", CH2)]
    async with httpx.AsyncClient(base_url=base, headers=headers, timeout=30.0) as client:
        for label, cid in chapters:
            r = await client.get(f"/api/v1/quizzes/chapter/{cid}/summary")
            r.raise_for_status()
            data = r.json()
            pool = data["pool_size"]
            print(f"{label} summary: pool_size={pool} pass%={data['pass_percentage']} q_per_attempt={data['questions_per_attempt']}")
            if pool < 1:
                print(f"  FAIL: expected pool_size >= 1 for seeded chapter")
                sys.exit(1)

            r2 = await client.post(f"/api/v1/quizzes/chapter/{cid}/attempts/start")
            r2.raise_for_status()
            start = r2.json()
            n = len(start["questions"])
            print(f"  start_attempt: got {n} questions, attempt_id={start['attempt_id']}")
            if n != 10:
                print(f"  FAIL: expected 10 questions, got {n}")
                sys.exit(1)
            for q in start["questions"]:
                if "correct_option" in q or "explanation" in q:
                    print("  FAIL: response leaked correct_option or explanation")
                    sys.exit(1)

            answers = [
                {"question_id": q["uid"], "selected_option": "a"}
                for q in start["questions"]
            ]
            r3 = await client.post(
                f"/api/v1/quizzes/attempts/{start['attempt_id']}/submit",
                json={"answers": answers},
            )
            r3.raise_for_status()
            sub = r3.json()
            print(f"  submit: score={sub['score']}/{sub['total']} passed={sub['is_passed']}")
            if "correct_option" in sub or "explanation" in sub:
                print("  FAIL: submit response leaked answer fields")
                sys.exit(1)

    print("\nAll quiz endpoint checks passed.")


if __name__ == "__main__":
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
    asyncio.run(main(base_url))

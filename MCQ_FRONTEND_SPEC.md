# MCQ Quiz — Frontend Spec (Handoff)

> **Purpose:** Implement the end-of-chapter MCQ quiz UI on the React frontend. Backend (FastAPI) team is implementing the APIs described in section 3 in parallel; do NOT change the API shapes, just consume them.
>
> Stack assumed: Vite + React 18 + TypeScript + Redux Toolkit + redux-persist + axios + React Router v6 + Tailwind. Same conventions as the existing `teachingPage` feature.

---

## 1. Behavior to implement

- The quiz becomes available on the **last page of any chapter**. A **Take Quiz** CTA is rendered at the bottom of the page in `BookAnimation`.
- Clicking **Take Quiz** navigates to a new route `…/chapter/:chapterId/quiz`.
- The quiz page first calls `GET …/summary` to render an intro card (best score, attempts, pass %, button label).
- Clicking **Take Quiz** / **Retake** calls `POST …/attempts/start` which returns a **fresh, unseen set of questions** every time (the server guarantees this — the FE must not cache and replay the previous attempt).
- User selects one option per question, clicks **Submit**.
- FE calls `POST …/attempts/{attemptId}/submit` with the answers; server scores it and returns the result + per-question review.
- FE shows the result screen with score, pass/fail badge, and per-question correct/incorrect markers + explanations.
- If `is_passed === true`, the chapter is now "Completed". The chapter card in lists should show a "Completed" badge sourced from the **extended `chapter_completion` payload** (`passed_at`, `best_quiz_score`).

**Hard rule:** never read or display `is_correct` from the `start` response — the server doesn't include it. It only appears in the `submit` response.

---

## 2. New routes

Add to `frontend/src/configs/routes.config/routes.config.ts` under `protectedRoutes`:

```ts
{
    key: 'chapter_quiz',
    path: `${APP_PREFIX_PATH}/my_books/book_detail/:bookId/chapter/:chapterId/quiz`,
    component: lazy(() => import('@/views/quizPage')),
    authority: [],
},
```

No new entry needed in `navigation.config` (deep-linked from TeachingPage, not the sidebar).

---

## 3. Backend API contract (consume as-is)

Base URL is the same `apiPrefix1` already configured in `appConfig`. All endpoints require the existing Bearer token (handled automatically by `BaseService.ts`).

### 3.1 GET `quizzes/chapter/{chapterId}/summary`

Pure metadata read — no questions, no Gemini call. Returns instantly.

**Response 200 (user has attempted before):**
```json
{
  "pass_percentage": 70,
  "questions_per_attempt": 10,
  "pool_size": 30,
  "best_score": 80,
  "is_passed": true,
  "attempts_count": 2,
  "last_attempt": {
    "attempt_id": "uuid",
    "score": 80,
    "is_passed": true,
    "submitted_at": "2026-04-30T12:34:56Z"
  }
}
```

**Response 200 (cold chapter — nobody has ever taken the quiz):**
```json
{
  "pass_percentage": 70,
  "questions_per_attempt": 10,
  "pool_size": 0,
  "best_score": null,
  "is_passed": false,
  "attempts_count": 0,
  "last_attempt": null
}
```

- `pool_size === 0` means the question pool hasn't been seeded yet. The FE still shows the **Take Quiz** button; seed runs lazily inside `start_attempt`.
- `best_score` and `last_attempt` are `null` until the user has at least one **submitted** attempt. `is_passed` is a strict boolean (`false`, not `null`).
- **Important — two different `is_passed` flags:**
  - **Top-level `is_passed`** = "the user has passed this chapter at least once". Stays `true` even after a later failed retake. This is what the **Completed** badge should be driven from.
  - **`last_attempt.is_passed`** = whether the most recent submitted attempt happened to pass. Only useful if you want to show "Last attempt: passed/failed" in the intro card.
- `last_attempt` only reflects **submitted** attempts; an in-progress attempt the user abandoned never appears here.

### 3.2 POST `quizzes/chapter/{chapterId}/attempts/start`

Body: `{}` (empty).

Response 200:
```json
{
  "attempt_id": "uuid",
  "started_at": "2026-05-01T10:00:00Z",
  "questions": [
    {
      "question_id": "uuid",
      "position": 1,
      "text": "What is ...?",
      "options": [
        { "option_id": "uuid", "text": "Option A" },
        { "option_id": "uuid", "text": "Option B" },
        { "option_id": "uuid", "text": "Option C" },
        { "option_id": "uuid", "text": "Option D" }
      ]
    }
  ]
}
```

**Notes:**
- Options are pre-shuffled by the server. Render in the order received.
- **First-time latency:** the very first user to start a quiz on a chapter will wait ~3-10s while Gemini seeds the question pool. All subsequent attempts return in <500ms. **Show a clear loading state** (e.g. spinner + "Generating your quiz..."), and do NOT timeout earlier than 30s.
- The response always contains exactly `questions_per_attempt` (10) questions.

### 3.3 POST `quizzes/attempts/{attemptId}/submit`

Body:
```json
{
  "answers": [
    { "question_id": "uuid", "selected_option_id": "uuid" },
    { "question_id": "uuid", "selected_option_id": null }
  ]
}
```

`selected_option_id` may be `null` for skipped questions.

Response 200:
```json
{
  "attempt_id": "uuid",
  "score": 80,
  "is_passed": true,
  "pass_percentage": 70,
  "submitted_at": "2026-05-01T10:05:00Z",
  "per_question": [
    {
      "question_id": "uuid",
      "selected_option_id": "uuid",
      "correct_option_id": "uuid",
      "is_correct": true,
      "explanation": "Because ..."
    }
  ]
}
```

### 3.4 GET `quizzes/attempts/me/chapter/{chapterId}`

Response 200:
```json
{
  "attempts": [
    { "attempt_id": "uuid", "score": 80, "is_passed": true,  "submitted_at": "..." },
    { "attempt_id": "uuid", "score": 60, "is_passed": false, "submitted_at": "..." }
  ]
}
```

### 3.5 Errors

Standard FastAPI `HTTPException` shape: `{ "detail": "<message>" }`. Common ones:
- `400` — submit payload contains a `question_id` not in this attempt's served set (forge guard).
- `403` — attempt does not belong to the current user.
- `404` — chapter / attempt not found.
- `409` — attempt already submitted (idempotency guard). Show "This quiz was already submitted" and route the user to the QuizResult screen for the prior attempt if you have it cached.
- `429` — submit too fast (rate limit). Show a "please wait" toast and disable the Submit button for ~2s. **Note:** `start_attempt` is NOT rate-limited in MVP.
- `502` — quiz seed failed at Gemini (rare). Show "Quiz couldn't be prepared right now, please try again." Re-clicking Take Quiz will retry.
- `503` (with `Retry-After: 10` header) — another user is currently seeding the same chapter and we waited 30s without success. Show "Quiz is preparing, please try again in a few seconds" and re-enable the Take Quiz button after the `Retry-After` interval.

**Submit body partial answers:** the FE may omit `question_id`s the user didn't answer. Any served question missing from the body is treated as `selected_option_id=null` and scored as wrong.

---

## 4. New service file

Create `frontend/src/services/QuizServices.ts` modeled on `ChapterServices.ts`:

```ts
import ApiService from './ApiService'

export async function apiGetQuizSummary<T>(chapterId: string) {
    return ApiService.fetchData<T>({
        url: `quizzes/chapter/${chapterId}/summary`,
        method: 'get',
    })
}

export async function apiStartQuizAttempt<T>(chapterId: string) {
    return ApiService.fetchData<T>({
        url: `quizzes/chapter/${chapterId}/attempts/start`,
        method: 'post',
        data: {},
    })
}

export async function apiSubmitQuizAttempt<T>(payload: {
    attemptId: string
    answers: { question_id: string; selected_option_id: string | null }[]
}) {
    return ApiService.fetchData<T>({
        url: `quizzes/attempts/${payload.attemptId}/submit`,
        method: 'post',
        data: { answers: payload.answers },
    })
}

export async function apiGetMyQuizAttempts<T>(chapterId: string) {
    return ApiService.fetchData<T>({
        url: `quizzes/attempts/me/chapter/${chapterId}`,
        method: 'get',
    })
}
```

---

## 5. New Redux slice

Create `frontend/src/views/quizPage/store/QuizSlice.ts` (mirror the `TeachingSlice.ts` pattern: `createSlice` + `createAsyncThunk` + `combineReducers({ data: reducers })` + `injectReducer('quiz', reducer)`).

State shape:
```ts
type QuizQuestion = {
    question_id: string
    position: number
    text: string
    options: { option_id: string; text: string }[]
}

type QuizSummary = {
    pass_percentage: number
    questions_per_attempt: number
    pool_size: number          // 0 means pool not yet seeded; UI still shows Take Quiz
    best_score: number | null
    is_passed: boolean
    attempts_count: number
    last_attempt: {
        attempt_id: string
        score: number
        is_passed: boolean
        submitted_at: string
    } | null
}

type QuizResultPerQuestion = {
    question_id: string
    selected_option_id: string | null
    correct_option_id: string
    is_correct: boolean
    explanation: string | null
}

type QuizResult = {
    attempt_id: string
    score: number
    is_passed: boolean
    pass_percentage: number
    per_question: QuizResultPerQuestion[]
}

type QuizState = {
    summary: QuizSummary | null
    currentAttempt: { attemptId: string; questions: QuizQuestion[] } | null
    selections: Record<string, string | null> // questionId -> optionId
    result: QuizResult | null
    loading: { summary: boolean; start: boolean; submit: boolean }
    error: string | null
}
```

Thunks:
- `fetchQuizSummary(chapterId)` -> sets `summary`.
- `startQuizAttempt(chapterId)` -> sets `currentAttempt`, clears `selections` and `result`.
- `submitQuizAttempt({ attemptId, answers })` -> sets `result`. On `is_passed=true`, also dispatch a follow-up `getChapterProgress(chapterId)` (already in `TeachingSlice`) so the chapter card shows the new `passed_at` / `best_quiz_score`.

Reducers:
- `setSelection({ questionId, optionId })` -> updates `selections[questionId]`.
- `resetQuiz()` -> clears `currentAttempt`, `selections`, `result` (used when user leaves the page).

**Critical rule:** the **Retake** button must dispatch `startQuizAttempt(chapterId)` again — do not re-show `currentAttempt` from state. The fresh-question guarantee comes from the server, not from local state.

---

## 6. New view

Create `frontend/src/views/quizPage/` with:

```
quizPage/
  index.ts                        // re-exports default
  QuizPage.tsx                    // top-level: loads summary, switches between intro/runner/result
  components/
    QuizIntro.tsx                 // shows summary + "Take Quiz" / "Retake" button
    QuizRunner.tsx                // renders questions, manages selections, Submit button
    QuizResult.tsx                // shows score + per-question review + Retake / Back-to-Chapter
  store/
    QuizSlice.ts
    index.ts                      // combineReducers({ data: reducers }) + injectReducer
```

### QuizPage.tsx

- Reads `chapterId` from `useParams`.
- On mount: dispatch `fetchQuizSummary(chapterId)` and `injectReducer('quiz', reducer)` (one-time).
- Renders one of three sub-screens based on state:
  - `result` truthy -> `<QuizResult />`
  - `currentAttempt` truthy -> `<QuizRunner />`
  - else -> `<QuizIntro />`
- On unmount, dispatch `resetQuiz()`.

### QuizIntro

Header text. Stats row: pass %, best score, attempts. CTA button:
- If `summary.attempts_count === 0` -> button label **"Take Quiz"**.
- Else -> **"Retake Quiz"** with helper text "Best score: X%. You'll see different questions on each retake until the question bank repeats."
- onClick -> `dispatch(startQuizAttempt(chapterId))`.

### QuizRunner

- Render all questions in a single scrollable list (each card = one question + 4 radio options).
- Each option click -> `dispatch(setSelection({ questionId, optionId }))`.
- Bottom sticky bar: **Submit** button (disabled while `loading.submit`).
- Show "X of Y answered" counter; allow submit even with unanswered (server treats as null).
- Confirm dialog if user tries to submit with > 0 unanswered.
- onSubmit -> `dispatch(submitQuizAttempt({ attemptId, answers }))`.

### QuizResult

- Big score number + pass/fail badge.
- If failed: show **Retake Quiz** button (calls `startQuizAttempt` -> fresh set).
- If passed: show **Back to Chapter** + congratulations note.
- Below: per-question review list — green tick for correct, red cross for wrong, show user's choice vs correct choice, show `explanation` if present.

---

## 7. Trigger from TeachingPage

In `frontend/src/views/teachingPage/components/BookAnimation.tsx`:

- When `currentPage === pages.length` (user reached the last page), show a **Take Quiz** button below the book / next to the existing controls.
- Do **not** auto-redirect to the quiz — that interrupts the teaching/audio session.
- onClick handler:

```ts
import { useNavigate } from 'react-router-dom'
import { APP_PREFIX_PATH } from '@/constants/route.constant'

const navigate = useNavigate()
const handleTakeQuiz = () => {
    navigate(`${APP_PREFIX_PATH}/my_books/book_detail/${bookId}/chapter/${chapterId}/quiz`)
}
```

If `chapter_completion.passed_at` is set, change the button label to **Retake Quiz** with a small "Completed" badge nearby.

---

## 8. Chapter completion display

The backend now returns these extra fields on `GET chaptercompletions/{chapter_id}`:

```json
{
  "uid": "uuid",
  "current_page": 12,
  "passed_at": "2026-05-01T10:05:00Z",
  "best_quiz_score": 80,
  "quiz_attempts": 2
}
```

- Update the existing `getChapterProgress` thunk's TypeScript type and the `TeachingSlice` state to include `passed_at` and `best_quiz_score`.
- Wherever a chapter card is rendered (Books pages, TeachingPage header), show a **"Completed"** badge when `passed_at` is non-null.
- Optionally show "Best: X%".

---

## 9. Acceptance checklist

- [ ] New route `/app/my_books/book_detail/:bookId/chapter/:chapterId/quiz` is registered and protected.
- [ ] Take Quiz button appears on the last page of a chapter in `BookAnimation`.
- [ ] Quiz page shows intro card with stats from `summary` API (works even when `pool_size === 0`).
- [ ] Clicking Take Quiz / Retake hits `attempts/start` and renders fresh questions on each attempt (verify in Network tab — different `question_id`s on consecutive attempts as long as unseen questions remain. With pool size 30 and 10 questions per attempt, **starting from attempt 4** the user may start seeing repeats — that's the MVP recycle behavior, not a bug).
- [ ] First-ever click on a chapter shows a clear loading state for up to ~10s while the pool is seeded; subsequent attempts are fast.
- [ ] Submitting returns score + per-question review; UI shows correct/incorrect markers + explanations.
- [ ] If passed, chapter card shows a Completed badge driven by `passed_at`.
- [ ] No request anywhere in the FE reads `is_correct` from the `start` response (it isn't there).
- [ ] 429 from `submit` shows a "please wait" toast and re-enables Submit after ~2s.
- [ ] 502 from `start` shows a "couldn't prepare quiz" message with a Retry button.
- [ ] 503 from `start` (concurrent seeding) shows a "preparing, try again shortly" message and respects the `Retry-After` header.
- [ ] Mobile and desktop layouts both work (use existing Tailwind/twin.macro patterns).

---

## 10. Out of scope (Phase 2)

- Background top-up generation that grows the pool past 30 questions over time.
- Admin authoring UI for manually overriding generated questions.
- Quiz timer / countdown.
- Question difficulty filtering.
- Leaderboard / global ranking.

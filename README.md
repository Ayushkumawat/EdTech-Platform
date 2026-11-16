# AI Onwards

An AI classroom where a student opens a real textbook, turns the page, and learns with a teacher who can see that page and talk back.

The lesson is not a chat window sitting next to a PDF. The book itself is the classroom: pages flip, a voice teacher sits alongside, and the student can point at a page and ask it to be explained.

## A short look

Full tour, about 30 seconds: [walkthrough.mp4](docs/showcase/walkthrough.mp4)

The clip below is the part recruiters usually want to see: sign in, open the library, and land inside a chapter.

![From the library into a live chapter](docs/showcase/classroom.gif)

## What a student can do

**Arrive somewhere that feels like a product, not a dashboard.** The home page introduces personalized learning, a shelf of textbooks, and a set of AI teachers the student can switch by language.

![Home](docs/showcase/01-home.png)

![Textbooks on the home page](docs/showcase/03-textbooks.png)

![AI teachers, including English](docs/showcase/04-teachers.png)

**Pick a plan.** Lessons are metered. A student can start free, or move to a longer daily allowance. Prices are in rupees, with a discount called out on the plan that has one.

![Pricing](docs/showcase/05-pricing.png)

**Sign in and land in their own library.** Email and password, or Google. After sign-in the library is filtered by class and subject, and each book shows its teacher, language, length, and chapters.

![Sign in](docs/showcase/06-sign-in.png)

![Book library](docs/showcase/07-library.png)

Each book opens onto its chapters, the teacher, and how long the course runs.

![A book and its chapters](docs/showcase/08-book-detail.png)

**Open a chapter as a book, not a document.** The spread turns like paper. Hover the next page and the student can continue from there, with an optional spoken follow-up. A teacher panel stays on the side: who is teaching, the subject, and a place to ask a question or start the lesson.

![Chapter as a turning book](docs/showcase/09-classroom.png)

![Continue this page](docs/showcase/10-continue-page.png)

The same idea shows up earlier on the marketing page: lessons that follow the student's pace, and teachers who can work in more than one language.

![Personalized lessons](docs/showcase/02-personalized.png)

## What it is built with

| Piece | Used for |
| --- | --- |
| React, TypeScript, Vite | The whole interface |
| Tailwind CSS | Layout and the dark classroom |
| Redux Toolkit | Sign-in, the library, and lesson progress |
| Framer Motion | The page hover and the focus animation on the home page |
| react-pageflip | The turning book, with a real page-turn sound |
| Gemini 2.5 Flash, native audio | The live voice teacher. The open page is sent as an image so the explanation matches what the student is looking at |
| ElevenLabs Multilingual v2 | Spoken answers, including Hindi and English lessons |
| Google Sign-In | One-tap account access |
| Web Audio | The small voice meter beside the teacher |
| A 3D audio visual, built with OGL and Lit | The live-audio lab, where a picture or a line of text can be handed to the same voice model |

There is also a live-audio bench in the product for trying that voice model directly: send a page image, a line of text, or a short recorded prompt and hear the teacher respond.

## A note on these pictures

The hosted API was not running, so the library and the chapter in the tour are sample data played through the real interface. The screens, the book, and the teacher panel are the application itself. The application code was not changed to capture this.

Home, pricing, and sign-in do not need that API. The book library and a chapter do.

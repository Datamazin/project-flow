- [x] Verify that the copilot-instructions.md file in the .github directory is created. (Created file with required checklist)

- [x] Clarify Project Requirements (Confirmed Next.js app with todo, kanban, doc editor, chatbot, local storage, aesthetic UI)
  - Ask for project type, language, and frameworks if not specified. Skip if already provided.

- [x] Scaffold the Project (Used create-next-app with TypeScript, Tailwind, app router, src directory, alias)
  - Ensure the previous step is complete before scaffolding.
  - Prefer the project setup tool with the `projectType` parameter when available.
  - Run scaffolding commands from the workspace root (`.`).
  - If no matching template exists, build the structure manually with the file tools.

- [x] Customize the Project (Added local-first todo, kanban, document editor, and chat panels with Tailwind UI polish)
  - Confirm earlier checklist items are complete.
  - Draft a change plan, then implement updates using the recommended tools and references.
  - Skip heavy customization for simple hello-world demos.

- [x] Install Required Extensions (No additional VS Code extensions requested)
  - Install only extensions specified by `get_project_setup_info`; otherwise mark this step as not required.

- [x] Compile the Project (npm run lint)
  - Confirm earlier tasks are complete, install missing dependencies, and resolve diagnostics.
  - Review project markdown guidance if compilation steps need clarification.

- [x] Create and Run Task (NPM scripts sufficient; no VS Code task needed)
  - Use existing npm scripts; only create VS Code tasks when requirements exceed current scripts.

- [ ] Launch the Project
  - Confirm prerequisites, ask how the user wants to launch/debug, and run only after approval.

- [ ] Ensure Documentation is Complete
  - Verify README and this file describe the current project state; remove temporary notes when done.

- [ ] Describe Current Project Status
  - Add or update a short summary in README.md so new contributors understand the app's latest capabilities and pending work.

# Execution Guidelines

- Track progress using the checklist above and add brief summaries as tasks finish.
- Keep communication concise; summarize command output instead of pasting everything.
- Default to the workspace root for commands and avoid creating new folders unless requested.
- Install dependencies or extensions only when explicitly required.

# Development Rules

- Maintain the local-first workflow and Tailwind aesthetic when updating features.
- Validate changes with `npm run lint` and update documentation when behavior shifts.
- Clarify ambiguous feature requests before implementation; avoid assumptions.
- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.

TDD, BDD in React - Part One
===

Welcome to this workshop series. It is a series consisting in five parts focusing on the application of BDD, TDD to our every day workflow for a React/redux application.

In this first part we will see some models and approaches to test our app in a way that we can apply TDD and BDD


# Containers and components

You will benefit from writing UI components or as I call them "dumb components" since they are far easier to test when they are pure.

> given some props, a pure component will render the same markup

But what if I need some state, or some side effects?

> a container can wrap a dumb component and manage state on its behalf

Business logic then can be isolated in reducers.

These are the main ideas for architecture that will help you build a React application as clean as possible.

# Visual Regression testing, DOM snapshots

There are a lot of tools that do UI comparison, DOM comparison, but I really don't recommend them unless your design team want to experiment with them. It is a labyrinth, hard to escape:

- Increases size of codebase
- Does not work well in different machines
- DOM trees change a lot in development
- False positives

Instead:
- Talk to your design team often
- Do UI reviews
- Let your design team have access to CI/PR URLs so they can check content in every PR.

Also we will not test styled components because of the same principle, they change a lot in the development process and we want to focus on the functionality, not in the looks for now.

# Don't test side effects

TDD works well with pure components, but we know that not everything is pure in the front-end. Side effects, network calls, animations...

Don't complicate your existence with complex unit tests that make use of mocks, stubs, spies or other code smells like "before" and "after" hooks.

> Unit test should be easy and focused on the atomic parts of your program, the functions/components

I remember years ago I tend to complicate everything with sinon. Great tool really, but I also remember wasting time in learning how to hijack the `require` function and changing how it populates with dependencies. 

> Mocks are a code smell

Instead we can create integration and e2e tests focus on the integration of the different components that are used in our app. We are going to use BDD for that and browser automation.

# Browser automation

I could do an entire series on browser automation because I think it is a little difficult to add it to your workflow if you are newcomer, since it requires configuration that varies between automation tools and most of them require maintenance (like updating drivers). 

To add to that, integration tests are more complex to set in a development environment because we will have to start our app, and other third party stubs before executing them and tear them down after. In the "backend series" I explained how to spawn processes within cucumber hooks to solve this problem.

Nevertheless, the benefits are huge:

- Having a dev environment to test against makes you independent of a third party having to provide a sandbox environment for you.
- The possibility of running same tests against different environments like production
- You can set up a CI on every PR
- Run whole regression after CD to check the deployment went well.
- Create cron jobs to run regressions every X hours against production
- The customer will love you if regressions generate a report and a URL to see it automatically.

We are going to use "puppeteer" in our examples, because it is easier to configure than a "selenium" - driver stack. It uses the "chrome dev tools protocol" with its API to connect to a chromium instance. It also downloads chromium automatically if you wish, which makes it more suitable for a CI container.


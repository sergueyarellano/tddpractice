TDD, BDD in Javascript World
===

The benefits of applying test-driven development (TDD) methodologies in our every day are huge:

- Tested code, great coverage
- Modular and loosely coupled code
- Great relation and understanding between customer - PM - developer
- [40% - 80% fewer bugs](https://www.researchgate.net/publication/3249271_Guest_Editors'_Introduction_TDD--The_Art_of_Fearless_Programming) in production
- Can save development time with some experience

TDD stands for Test Driven Development and the process consist on:
- Write a test and watch it fail
- Implement minimal expression of code to make it pass
- Refactor both test and code if needed

TDD saves everybody in your team a lot of time. Putting in place some continuous integration and deployment (CI/CD) will make sure that every change have to pass all other tests in the codebase before merging them. 

> You will loose the "fear of change"

If we complement TDD with Behavior driven development (BDD), then we can go home knowing we are doing the good thing.

> I like to sleep good at night, that is why I TDD and BDD

TDD process is more focused in unit testing while BDD (branch of TDD) is more focused on producing integration tests with a concept we call "black box testing".

The problem I see that a lot of companies have is the "inverted pyramid of testing". Firstly, it is not cost effective.
<table>
  <tbody>
    <tr>
      <td align="center" valign="top">
        <img width="350" height="270" src="docs/pyramid_inverted.png">
        <br>
        <p>Manual testing is very expensive</p>
      </td>
      <td align="center" valign="top">
        <img width="350" height="270" src="docs/pyramid.png">
        <br>
        <p>Unit tests should form the base amount of tests in your project</p>
      </td>
     </tr>
  </tbody>
</table>

I call it "the inverted pyramid" and it does not stand still for so long since manual testing is very inefficient and expensive. The more you go to the top the more expensive it is. The point here is not about replacing every manual test and say good bye to the QA team, no, I love my QA team mates! the point here is starting to take responsibility of what you create, what you code. Manual testing is still important, like exploratory testing and other forms, but we have to reduce the impact/cost of manual testing as much as we can. How? automating tests by adopting the BDD process.



Two obstacles that we are going to combat in the series:
- laziness
- inexperience

You will become a better developer, your team mates will love your contributions and your customers will be in the same page as you are on what features have to be delivered.

The series consists on applying BDD, TDD workflow in
- a Node JS environment where we will create an express app with a declarative and functional style.
- A front-end environment where we will create a React app with the help of browser automation.


# Backend - Node JS


- [Preparation and mental models](docs/part1.md)
- [BDD, TDD Framework set up](docs/part2.md)
- [Writing features with Cucumber, BDD](docs/part3.md)
- [Writing code with TDD](docs/part4.md)
- [Refactoring and some notes](docs/part5.md)


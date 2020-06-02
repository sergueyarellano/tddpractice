TDD, BDD in javascript - part one
===

Some Preparation and mental models
===


TDD encourages simple designs and inspires confidence

It is a development process based on repetion of a simple cycle: 


- Add a test and see it fail
- Write minimal expression of code to make the test pass
- Refactor code

We use this process because it encourages us to focus more on an interface rather than in the implementation.

# Declarative code

We are not going to see tests yet, just some mental models.

Let's take a look at one of my backend's modules

```javascript
module.exports = {
  replaceParams,
  composeURL,
  ...
}
```

let's see how we can use that API:

```javascript
const template = 'connected/{vin}/{action}'
const params =  {vin: 123, action: 'battery'}
const endpoint = replaceParams(template, params) // connected/123/battery
const host = process.env.HOST
const uri = composeUrl(host, endpoint) // http://api.name.com/connected/123/battery
const requestOptions = { uri }
```

As you might noticed, from the consumer perspective, the code reads pretty declarative right?

- `replaceParams` takes a `template` and `params` to replace, and assigns the returned value to `endpoint`
- `composeURL` takes a `host` and an `endpoint` and assigns the returned value to `uri`

Declarative means that we see the **WHAT** not the **HOW**. We didn't need to see the implementation neither `replaceParams` nor `composeURL`.

> TDD encourages us to make a more readable and declarative code

# Doing the research

To first understand how we can apply TDD to our project we have to be honest with ourselves and do some research and decide what is best for our purpose:

- patterns
- abstractions

## Patterns that work well
Since I need to write a piece that acts as a middleware (backend that receives requests, composes new ones to other domains), I'm going to choose the simplest pattern ever, the module pattern. Looks like this:

```javascript
module.exports = {
  method1,
  method2,
  ...
}

function method1 () {}

function method2 () {}
```
If you are asking why I don't use function expressions like `const method1 = () => {}` it is because they don't hoist (look for javascript hoisting if you are not sure) and with this way you can open the file and see at a first glance the API you are exposing, `method1` and `method2`, instead of having to scroll to the bottom of the file

## Abstractions

Fancy word isn't it? At the end of the day it means tools that you can use as a `semantic binding` for other tools. Something that helps us composing larger programs with smaller ones could be another explanation.

I'm gonna choose a composable abstraction that is gonna help me implement the business logic (how data is changed/transformed) in a reusable and composable way. 

Let's talk about pipe.

```javascript

// pipe :: [any -> any] -> any -> any

pipe(
  executeFirst,
  executeSecond
)(initialValue)
```

The following is an equivalent:

```javascript
 executeSecond(executeFirst(initialValue))

 /*
  Order of execution due to eager evaluation
 */
```


There is just one rule that pipe has to follow, the signature of each function in each step has to be the same, and input, output should have the same type:

or in a more concrete way:

```javascript
pipe(
  initialValue => firstOutput, // String -> String
  firstOutput => secondOutput, // String -> String
  secondOutput => finalResult, // String -> String
)(initialValue)
```

# Doing the research (2)

Patterns an abstractions will help us in writing a loosely couple code, but we also need to decide which testing frameworks to use.

- unit test framework
- integration test framework

Just remember:
> With complicated frameworks you tend to do complicated things

## Unit
I recommend you to use [tape](https://www.npmjs.com/package/tape) as it is the simplest and more transparent way to **unit** test your functions. It is also a nice fit to test in a node environment.

Get used to the way it works:

```javascript
const test = require('tape');
 
test('greet should compose a greeting', function ({equal, end}) {
   const actual = greet('dog') 
   const expected = 'Hi dog!'
   equal(actual, expected)
   end()
});
```

Try to repeat the same `actual`, `expected`, `equal` structure. With those three, you can test everything.

> Forget about stubs, mocks or related stuff. Having to use those is just a code smell that says nothing good about your functions.

## Integration

Good old [cucumber](https://github.com/cucumber/cucumber-js) will do the trick. We can write tests in a **BDD** manner:

```gherkin
Feature: Simple maths
  In order to do maths
  As a developer
  I want to increment variables

  Scenario: easy maths
    Given a variable set to 1
    When I increment the variable by 1
    Then the variable should contain 2
```

BDD is a branch of TDD and it is more focused on testing how the integration between components and programs work. In part 2 we will be hands on practice to gain experience.

# Summary

To start doing TDD and BDD we need some preparation first. Deciding on what patterns and abstractions we are going to use to write more composable and loosely couple code is crucial. TDD will help us on our way to create simpler architectures reducing the amount of bugs we would have if we focused our attention only in the implementation.

Powerful ideas, let's see how can we apply them in our workflow in part 2

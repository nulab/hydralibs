# Introduction

This repository contains a collection of libraries from state management to bootstrapping a react application with HMR and routing easily

# Motivation

I wanted to simplify the development of a web application in react from bootstrapping to new ways to update the state

## Updating state

Usually to manage the state in react you can use a React component with setState so using a local state
You can also use redux and their interpreter pattern
Each other way don't provide out of the box a way to handle async and stream operations, you usually have to use some add-on or managing yourself if you use setState

Dispatch in redux is very interesting it allow us to decouple component logic. Component dispatch action and are received by the receiver which process them and update the state

I was wondering about why not dispatching function instead of action ?

hydra-dispatch does that and we provide scheduler for react setState and redux

You can just choose which scheduler you want to use and write just javascript function. This lead to a more natural style and easier to grasp than redux and setState especially when handling async and function that return a stream.


## Bootstrapping

Usually when i write some react application the base is almost always the same so i've build a library to make this bootstrap step done

# Contributions

Contributions are always welcome :)

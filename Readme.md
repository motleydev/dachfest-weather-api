# GeocodeQL

GeocodeQL is a supplementary project for the Schema Stitching demo from [GraphCMS](https://www.graphcms.com). Fully interesting in its own right, I cannot claim any of the brilliance behind the original idea or execution. The code here is directly extended from the original work done by [@mattdionis](https://github.com/Matt-Dionis). I've simply adapted it for my needs.

## Getting Started

Create a `now-secrets.json` file with the following shape.

```
{
    "@google": "YOUR GOOGLE MAP API KEY",
    "@darksky": "YOUR DARKSKY API KEY"
}
```

Then install the dependencies with `yarn` and run the project with `yarn start`.
You can build the server with `yarn build` and host the project if you have the `now-cli` installed by typing `now` from the root of the project.

Happy coding!
 
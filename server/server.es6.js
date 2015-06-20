recEngine = {
  link(user, item) {    // Pass in ID for user and item. Or at least, some unique identifier...
    let addLink = function() {
      if (!RecEngine.findOne({ link: {user:user, item:item} })) { // Checks to make sure the association has not already been made.
        RecEngine.insert({
          link: { user, item }
        });
      } else {
        console.error("User-item pair already exists")
      }
    };
    let updateFlow = function() {
      console.log("running");
    };

    addLink();
    updateFlow();

  },
  suggest() {
    // Basically, this just calls max flow
    fn = new FlowNetwork();
    // fn.addEdge('s','o',3);
    // fn.addEdge('s','p',3);
    // fn.addEdge('o','p',2);
    // fn.addEdge('o','q',3);
    // fn.addEdge('p','r',2);
    // fn.addEdge('r','t',3);
    // fn.addEdge('q','r',4);
    // fn.addEdge('q','t',2);
    var max = fn.maxFlow('s','t'); // this should be called for every item in the database to get the "flow", which equates to the ranking of how closely associated it is (ie, how highly recommended)
    console.log(max);

    return "suggestion time"
  }
}

Meteor.startup(function() {
  // recEngine.link('bob', 'cat')
  if (RecEngine.find().fetch().length === 0) {
    recEngine.link("Jordan Santo", "Cognac");
    recEngine.link("Jordan Santo", "Beer");
    recEngine.link("Jordan Santo", "Coffee");
    recEngine.link("Jordan Santo", "Bourbon");
    recEngine.link("Jordan Santo", "Scotch");
    recEngine.link("Jordan Santo", "Tequila");
    recEngine.link("Jordan Santo", "Lemon Drop");
    recEngine.link("Jordan Santo", "Whiskey Sour");
    recEngine.link("Matt Pautler", "Beer");
    recEngine.link("Matt Pautler", "Wine");
    recEngine.link("Matt Pautler", "Scotch");
    recEngine.link("Sam Jolly", "Scotch");
    recEngine.link("Sam Jolly", "Beer");
    recEngine.link("Sam Jolly", "Tequila");
    recEngine.link("Sam Jolly", "Rusty Nail");
    recEngine.link("Sam Corcos", "Rusty Nail");
    recEngine.link("Sam Corcos", "Wine");
    recEngine.link("Sam Corcos", "Scotch");
    recEngine.link("Sam Corcos", "Bourbon");
    recEngine.link("Jeff Wagner", "Beer");
    recEngine.link("Jeff Wagner", "Punch");
  }

})

Meteor.methods({

})

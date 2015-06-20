recEngine = {
  link(user, item) {    // Pass in ID for user and item. Or at least, some unique identifier...
    let addLink = function() {
      if (!RecEngine.findOne({ link: {user:user, item:item} })) { // Checks to make sure the association has not already been made.
        RecEngine.insert({ link: { user, item } }, function(err, res) {
          if (!err) { updateFlow(); }
        });
      } else {
        console.error("User-item pair already exists");
      }
    };
    let updateFlow = function() {
      let userLinks = RecEngine.find({"link.user": user}).fetch(); // This returns an array of all the things the user has liked.
      let items = R.pluck('item')(R.pluck('link')(userLinks)); // We now have an array of the item IDs.

      _.each(items, function(el, i) { // TODO this is going to be a disaster in the long run. We have to find a way to make this more efficient
        // console.log(i + " " + el);
        let selector1 = selector2 = {};
        selector1['edge.'+item] = {$exists: true};
        selector2['edge.'+el] = {$exists: true};

        let found1 = RecEngine.findOne(selector1)
        let found2 = RecEngine.findOne(selector2)

        if ( found1 ) {
          console.log("****Found 1");


          // selector['edge.'+item+el] = {$exists: true};
          // console.log(test);
          // if ( RecEngine.findOne(selector) ) {
          //   console.log("running");
          // }
        } else if ( found2 ) { // Otherwise, create a new one
          console.log("Found2****");



        } else {
          let node = {};
          node["edge"] = {};
          node["edge"][item] = {};
          node["edge"][item][el] = 1;

          RecEngine.insert(node, function(err,res) {
            if (err) { console.error(err); };
          })

        }


        // RecEngine.upsert(selector, modifier, false, function(err,res) {
        //   if (err) { console.error(err); };
        // });
      })

      // _.each(items, function(el, i) {
      //   console.log(i + " " + el);
      //   let selector = {};
      //   selector["edge"] = {};
      //   selector["edge"][el] = {};
      //
      //   let modifier = {};
      //   modifier["edge"] = {};
      //   modifier["edge"]["$inc"] = {};
      //   modifier["edge"]["$inc"][item] = 1
      //
      //   RecEngine.upsert(selector, modifier, false, function(err,res) {
      //     if (err) { console.error(err); };
      //   });
      // })
    };
    addLink();
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

  if (Addresses.find().count() === 0) {
    _.each(_.range(1000), function(el, i) {
      console.log("Adding address #" + i);
      let address = faker.address.country();
      Addresses.insert({ address })
    })
  }

  // Create 1000 users
  if (Meteor.users.find().count() < 10) {
    _.each(_.range(10), function(el, i) {
      console.log("Creating user #" + i);
      let name = faker.name.findName();
      let username = faker.internet.userName();
      Accounts.createUser({
        username,
        profile: {
          name
        },
        password: 'password'
      })
    })
  }

  if (RecEngine.find().fetch().length === 0) {
    let addresses = Addresses.find().fetch();
    let users = Meteor.users.find().fetch();

    _.each(addresses, function(el, i) {
      user = _.sample(users)
      console.log("Running #" + i + " -- Linking " + user.username + " to " + el.address);
      recEngine.link(user._id, el._id);
    })
  }

})

Meteor.methods({

})

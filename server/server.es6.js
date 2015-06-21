recEngine = {
  link(user, item) {
    let addLink = function(user, item) {

      /* Checks to make sure the association has not already been made. */
      if (!RecEngine.findOne({ link: {user, item} })) {
        /* If the link does not already exist, create it */
        RecEngine.insert({ link: { user, item } }, function(err, res) {
          /* If there is an error, log it */
          if (err) { console.error(err) ;};
          /* Then, update the weights for flow */
          return updateFlow(user, item);
        });
      } else {
        console.error("User-item pair already exists");
        return updateFlow(user, item);
      };
    };
    let updateFlow = function(user, item) {
      /* This returns an array of all the things the user has liked. */
      let userLinks = RecEngine.find({"link.user": user}).fetch();
      /* We now have an array of the item IDs. */
      let items = R.pluck('item')(R.pluck('link')(userLinks));

      /* For each item in the array of items above, link it with the item that is being passed through link(). */
      _.each(items, function(el, i) {
        let incMod = {$inc:{}};
        let matchMod = {$inc:{}};

        matchMod.$inc[item] = 1;
        incMod.$inc[el] = 1;

        /* This has to run twice since we want the weight reflected on both nodes. */
        RecEngine.upsert({node: el}, matchMod, false, function(err, res) {
          if (err) { console.error(err);};
        });
        RecEngine.upsert({node: item}, incMod, false, function(err,res) {
          if (err) { console.error(err);}
        });
      });
    };
    addLink(user, item);
  },
  suggest(user, num=1) {
    let result = []

    // TODO needs to run max flow for each item. That's a lot of items!

    /* This returns an array of all the things the user has liked. */
    let userLinks = RecEngine.find({"link.user": user}).fetch();
    /* We now have an array of the items. */
    let items = R.pluck('item')(R.pluck('link')(userLinks));

    let allNodes = RecEngine.find({node: {$exists: true}}).fetch();
    let nodeKeys = R.pluck('node')(allNodes);
    let fn = new FlowNetwork();

    let addUserEdges = function (cb) {
      /* We need to add a link of weight... 1? 99999? between the user and all the things he is linked to */
      _.each(items, function(item) {
        fn.addEdge( user, item, 999); // TODO this might have to be 99999 or 1... Not sure how this works yet
      })
      cb();
    }
    let addOtherEdges = function(cb) {
      /* For each node (location) object, add the appropriate edges */
      /* This builds the entire flow network */
      _.each(allNodes, function(node) {
        nodeWithoutIdOrSelf = R.omit(["_id","node"], node)
        for (let prop in nodeWithoutIdOrSelf) {
          fn.addEdge(node.node, prop, nodeWithoutIdOrSelf[prop]);
        }
      })
      cb();
    }
    let getMaxFlow = function() {
      // console.log(result.push(fn));
      // console.log(JSON.stringify(fn, null, 2)); // TODO this gives me an error: "Converting circular structure to JSON". Makes me think there might be a problem with my fn
      /* Once you've built the entire flow network... */
      _.each(nodeKeys, function(nodeKey) {
        // console.log("keys?");
        // console.log(user, nodeKey);

        //TODO THE ERROR IS HERE...

        let max = fn.maxFlow(user, nodeKey);
        console.log("max   --   "+ max);
        result.push({node:nodeKey, rating:max});
      })
    }

    addUserEdges(function() {
      addOtherEdges(function() {
        getMaxFlow();
      });
    });



    return result;
  }
}

Meteor.startup(function() {

  if (Addresses.find().count() === 0) {
    _.each(_.range(100), function(el, i) {
      console.log("Adding address #" + i);
      let address = faker.address.country();
      let test1 = new RegExp('\\.', 'ig');
      let test2 = new RegExp('\\?', 'ig');

      // TODO we can get rid of this test once we get IDs working...
      if (!test1.test(address) && !test2.test(address)) { // Needs to check to make sure there are no "." or "$" in the word
        Addresses.insert({ address })
      } else { console.error("Word contained illegal character.");}
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
      // console.log("Running #" + i + " -- Linking " + user.username + " to " + el.address);
      recEngine.link(user.username, el.address);
      // recEngine.link(user._id, el._id); // For whatever reason, this does not work with IDs, but it works perfectly with strings... Huh...
    })
  }

})

Meteor.methods({
  suggest: function(user, num) {
    return recEngine.suggest(user, num)
  }
})

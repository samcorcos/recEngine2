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
        console.log("Linking " + item + " + " + el);

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
      console.log("Running #" + i + " -- Linking " + user.username + " to " + el.address);
      recEngine.link(user.username, el.address);
      // recEngine.link(user._id, el._id); // For whatever reason, this does not work with IDs, but it works perfectly with strings... Huh...
    })
  }

})

Meteor.methods({

})

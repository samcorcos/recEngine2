Template.main.rendered = function() {
  Meteor.call('suggest', "Hunter_Fahey", 1, function(err, res) {
    console.log(res);
  })
}

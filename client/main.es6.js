Template.main.rendered = function() {
  Meteor.call('suggest', "Jewel_Dooley47", 1, function(err, res) {
    console.log(res);
  })
}

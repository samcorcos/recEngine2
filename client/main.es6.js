Template.main.rendered = function() {
  Meteor.call('suggest', "Earline.Howe", 1, function(err, res) {
    console.log(res);
  })
}

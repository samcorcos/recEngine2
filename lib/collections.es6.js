RecEngine = new Mongo.Collection('recEngine');
Addresses = new Mongo.Collection('addresses');

/*
{
  link: {
    user: userId
    item: itemId
  }
}

{
  flow: {
    nodes: [item1, item2] // this must be sort() before adding to avoid duplicates
    weight: 1
  }
}



*/

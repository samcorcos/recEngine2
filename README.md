#Ford Fulkerson recommendation engine

1. Seed the database with user links (linking users and items)
2. Take each of those user links and increment the weight of the related array for the other items that user has linked to
3. Use that data to run maxFlow to get suggestions

At some point, we need to make sure the data going in does not contain $ or .

The algorithm needs to work for IDs... Not sure why it is not at the moment

let dbPromise = idb.open("restaurants reviews", 2, function(upgradeDb) {
  switch(upgradeDb.oldVersion) {
    case 0:
    upgradeDb.createObjectStore("restaurants", {
    keyPath: "id"
    });
    case 1:
    upgradeDb.createObjectStore('reviews', {
      keyPath: 'id'
    });
  }
});

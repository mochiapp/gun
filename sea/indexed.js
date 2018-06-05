
    // This is safe class to operate with IndexedDB data - all methods are Promise
    function EasyIndexedDB(objectStoreName, dbName = 'GunDB', dbVersion = 1) {
      // Private internals, including constructor props
      const runTransaction = (fn_) => new Promise((resolve, reject) => {
        const open = indexedDB.open(dbName, dbVersion) // Open (or create) the DB
        open.onerror = (e) => {
          reject(new Error('IndexedDB error:', e))
        }
        open.onupgradeneeded = () => {
          const db = open.result // Create the schema; props === current version
          db.createObjectStore(objectStoreName, { keyPath: 'id' })
        }
        let result
        open.onsuccess = () => {    // Start a new transaction
          const db = open.result
          const tx = db.transaction(objectStoreName, 'readwrite')
          const store = tx.objectStore(objectStoreName)
          tx.oncomplete = () => {
            db.close()        // Close the db when the transaction is done
            resolve(result)   // Resolves result returned by action function fn_
          }
          result = fn_(store)
        }
      })

      Object.assign(this, {
        async wipe() {  // Wipe IndexedDB completedy!
          return runTransaction((store) => {
            const act = store.clear()
            act.onsuccess = () => {}
          })
        },
        async put(id, props) {
          const data = Object.assign({}, props, { id })
          return runTransaction((store) => { store.put(data) })
        },
        async get(id, prop) {
          return runTransaction((store) => new Promise((resolve) => {
            const getData = store.get(id)
            getData.onsuccess = () => {
              const { result = {} } = getData
              resolve(result[prop])
            }
          }))
        }
      })
    }
    // This is IndexedDB used by Gun SEA
    const seaIndexedDb = new EasyIndexedDB('SEA', 'GunDB', 1)
    EasyIndexedDB.scope = seaIndexedDb; // for now. This module should not export an instance of itself!
    module.exports = EasyIndexedDB;
  
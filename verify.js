/* Copyright (c) 2019 - 2020, Nordic Semiconductor ASA
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.

3. Neither the name of Nordic Semiconductor ASA nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY, AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BELIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

const db = require('.');

const noDuplicates = Object.keys(db)
  .filter(key => key !== 'schemas')
  .map(list => {
    let numberOfItems;
    let numberOfUniques;
    if (list === 'companies') {
      let companyCodes = db[list].map(company => company.code);
      numberOfItems = companyCodes.length;
      numberOfUniques = (new Set(companyCodes)).size;
    } else {
      // GATT Attributes
      let uuids = db[list].map(gatt => gatt.uuid);
      numberOfItems = uuids.length;
      numberOfUniques = (new Set(uuids)).size;

      let identifiers = db[list].map(gatt => gatt.identifier);
      let numberOfUniqueIdentifiers = (new Set(identifiers)).size;
      if (numberOfItems !== numberOfUniqueIdentifiers) {
        console.error(`Failed to verify '${list}': '${numberOfItems - numberOfUniqueIdentifiers}' duplicate Identifier(s) found.`);
        return false;
      }

      const uuidtest = db[list].map(({ uuid }, i) => {
        if (! /^([A-F0-9]{4}|[A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12})$/.test(uuid)) {
          console.error(`Found incorrect uuid ${uuid} of item #${i} in ${list}`);
          return false;
        }
        return true;
      }).every(v => v);
      if (! uuidtest) return false;
    }

    if (numberOfItems !== numberOfUniques) {
      console.error(`Failed to verify '${list}': '${numberOfItems - numberOfUniques}' duplicate UUID(s) found.`);
      return false;
    }
    return true;
  })
  .every(v => v); // true if all are true

process.exit(noDuplicates ? 0 : 1);
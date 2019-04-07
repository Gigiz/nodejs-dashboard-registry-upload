const readline = require('readline');
const { PubSub, withFilter } = require('apollo-server-express');
const { Registry, registryFields } = require('../model/registry');

const csvTile = 'NOME,COGNOME,DATA DI NASCITA,CITTA,CODICE FISCALE'.replace(/\s/g, "");
const UPLOAD_COMPLETED = 'UPLOAD_COMPLETED';

const pubsub = new PubSub();
const resolvers = {
  Query: {
    registry: async (parent, args, context) => {
      return await Registry.find();
    },
  },
  Mutation: {
    upload: async (parent, { file, username }, context) => {
      const { createReadStream, filename, mimetype, encoding } = await file;

      const stream = createReadStream();

      let errors = [];
      const lineReader = readline.createInterface({ input: stream });
      
      lineReader.on('line', async (line) => {
        if (line.replace(/\s/g, "") !== csvTile) {
          let obj = line.split(',').reduce((acc, str, index) => {
            if (index > registryFields.length) {
              const error = { msg: 'Csv non formattato correttamente' };
              errors.push(error);
            }
            if (registryFields[index] === 'birthDate') {
              const pattern = /(\d{2})\/(\d{2})\/(\d{4})/;
              const birthDate = Date.parse(str.replace(pattern,'$3-$2-$1'));
              if (isNaN(birthDate)) {
                const error = { msg: `Data non valida alla riga ${index + 1} => ${str}` };
                errors.push(error);
              }
              acc[registryFields[index]] = birthDate;
            } else {
              acc[registryFields[index]] = str;
            }
            return acc;
          }, {});
          
          const registry = new Registry({
            ...obj,
          });
          
          await registry.save();
          
        }

      });

      lineReader.on('close', async () => {
        // TODO gestione errori
        pubsub.publish(UPLOAD_COMPLETED, { latestUpload: { success: true, username } });
      });

      return true;
        
    },
    remove: async (parent, args) => {
      await Registry.deleteMany();
      return true;
    },
  },
  Subscription: {
    latestUpload: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(UPLOAD_COMPLETED),
        (payload, variables) => {
          return payload.latestUpload.username === variables.username;
        },
      ),
    }
  },
};

module.exports = resolvers;

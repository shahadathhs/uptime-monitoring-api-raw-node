import fs from 'fs';
import path from 'path';

type Callback = (
  error: string | false,
  data?: string[] | string | undefined,
) => void;

interface FileLib {
  basedir: string;
  create: (
    dir: string,
    file: string,
    data: unknown,
    callback: Callback,
  ) => void;
  read: (dir: string, file: string, callback: Callback) => void;
  update: (
    dir: string,
    file: string,
    data: unknown,
    callback: Callback,
  ) => void;
  delete: (dir: string, file: string, callback: Callback) => void;
  list: (dir: string, callback: Callback) => void;
}

const lib: FileLib = {
  basedir: path.join(__dirname, '/../.data/'),

  create(dir, file, data, callback) {
    fs.open(
      `${this.basedir + dir}/${file}.json`,
      'wx',
      (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
          const stringData = JSON.stringify(data);

          fs.writeFile(fileDescriptor, stringData, (err2) => {
            if (!err2) {
              fs.close(fileDescriptor, (err3) => {
                if (!err3) {
                  callback(false);
                } else {
                  callback('Error closing the new file!');
                }
              });
            } else {
              callback('Error writing to new file!');
            }
          });
        } else {
          callback('There was an error, file may already exist!');
        }
      },
    );
  },

  read(dir, file, callback) {
    fs.readFile(`${this.basedir + dir}/${file}.json`, 'utf8', (err, data) => {
      callback(err ? err.message : false, data);
    });
  },

  update(dir, file, data, callback) {
    fs.open(
      `${this.basedir + dir}/${file}.json`,
      'r+',
      (err, fileDescriptor) => {
        if (!err && fileDescriptor) {
          const stringData = JSON.stringify(data);

          fs.ftruncate(fileDescriptor, (err1) => {
            if (!err1) {
              fs.writeFile(fileDescriptor, stringData, (err2) => {
                if (!err2) {
                  fs.close(fileDescriptor, (err3) => {
                    if (!err3) {
                      callback(false);
                    } else {
                      callback('Error closing file!');
                    }
                  });
                } else {
                  callback('Error writing to file!');
                }
              });
            } else {
              callback('Error truncating file!');
            }
          });
        } else {
          callback('Error updating. File may not exist.');
        }
      },
    );
  },

  delete(dir, file, callback) {
    fs.unlink(`${this.basedir + dir}/${file}.json`, (err) => {
      if (!err) {
        callback(false);
      } else {
        callback('Error deleting file');
      }
    });
  },

  list(dir, callback) {
    fs.readdir(`${this.basedir + dir}/`, (err, fileNames) => {
      if (!err && fileNames && fileNames.length > 0) {
        const trimmedFileNames = fileNames.map((fileName) =>
          fileName.replace('.json', ''),
        );
        callback(false, trimmedFileNames);
      } else {
        callback('Error reading directory!');
      }
    });
  },
};

export default lib;

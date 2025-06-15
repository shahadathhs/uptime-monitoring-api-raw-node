import fs from 'fs';
import path from 'path';

type Callback<T = string> = (
  err: boolean | NodeJS.ErrnoException | null,
  data?: T,
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

const baseDir = path.join(__dirname, '/../.data/');

const data = {
  read: (dir: string, file: string, callback: Callback<string>) => {
    fs.readFile(`${baseDir}${dir}/${file}.json`, 'utf8', (err, data) => {
      callback(err, data);
    });
  },

  create: <T>(dir: string, file: string, data: T, callback: Callback) => {
    fs.open(`${baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        const stringData = JSON.stringify(data);
        fs.writeFile(fileDescriptor, stringData, (writeErr) => {
          if (!writeErr) {
            fs.close(fileDescriptor, (closeErr) => {
              callback(closeErr);
            });
          } else {
            callback(writeErr);
          }
        });
      } else {
        callback(err);
      }
    });
  },

  update: <T>(dir: string, file: string, data: T, callback: Callback) => {
    fs.open(`${baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        const stringData = JSON.stringify(data);
        fs.ftruncate(fileDescriptor, () => {
          fs.writeFile(fileDescriptor, stringData, (writeErr) => {
            if (!writeErr) {
              fs.close(fileDescriptor, (closeErr) => {
                callback(closeErr);
              });
            } else {
              callback(writeErr);
            }
          });
        });
      } else {
        callback(err);
      }
    });
  },

  delete: (dir: string, file: string, callback: Callback) => {
    fs.unlink(`${baseDir}${dir}/${file}.json`, (err) => {
      callback(err);
    });
  },
};

export default data;

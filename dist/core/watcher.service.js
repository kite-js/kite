"use strict";
/**
 * Copyright (c) 2017 [Arthur Xie]
 * <https://github.com/kite-js/kite>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
/**
 * Watch service for watching file (controllers, services, and related files)
 */
class WatcherService {
    /**
     * Watch service for watching file (controllers, services, and related files) changes
     *
     * If service is `enabled`, every file change event will cause a module deletion from NodeJS `require.cache`,
     * the module will be loaded with changed content next time.
     *
     * This service will watch for all files recursively, if a file in set to be watched, it's children module
     * will be also watched, except:
     * - files in 'node_modules'
     * - files in Kite's root (in case of someone use Kite as a lib out of NodeJS module)
     */
    constructor(kiteroot, interval = 2000) {
        this.kiteroot = kiteroot;
        this.interval = interval;
        this.node_modules = path.sep + 'node_modules' + path.sep;
        // enabled ? this.enable() : this.disable();
    }
    /**
     * Enable watching service
     */
    setEnabled(enabled) {
        if (enabled) {
            this.enabled = true;
            if (!this.watching) {
                this.watching = new Map();
                this.logService.info('Watching for file changes');
            }
        }
        else {
            this.enabled = false;
            if (this.watching) {
                this.watching.forEach((callback, filename) => {
                    fs.unwatchFile(filename);
                });
            }
            delete this.watching;
        }
    }
    /**
     * Watch a file, if change detected, reload it
     *
     * Please note that this watcher is only works with node modules
     */
    watch(filename, callback) {
        // skip if:
        // 1. service not enabled
        // 2. file is under "node_modules"
        // 3. file is a kite module
        if (!this.enabled ||
            filename.includes(this.node_modules) ||
            filename.startsWith(this.kiteroot + path.sep)) {
            return;
        }
        // if a file is being watched, update callback function
        if (this.watching.has(filename)) {
            // update callback if set
            if (callback) {
                this.watching.set(filename, callback);
            }
            return;
        }
        fs.watchFile(filename, { interval: this.interval }, (curr, prev) => {
            this.logService.info(`Change detected at "${filename}"`);
            this.clearCache(filename);
        });
        this.watching.set(filename, callback);
        if (require.cache[filename]) {
            require.cache[filename].children.forEach((mod) => {
                this.watch(mod.filename);
            });
        }
    }
    /**
     * Clear node require cache, it's also search for parent modules, if parent modules are being watched, remove them too
     * @param filename filename to clear
     */
    clearCache(filename) {
        let removeList = new Set();
        removeList.add(filename);
        let keys = Object.keys(require.cache);
        let findRelated = (filenames) => {
            let removeWork = new Set();
            keys.forEach(key => {
                let mod = require.cache[key];
                // Only find managed files
                if (!this.watching.has(mod.filename) || removeList.has(mod.filename)) {
                    return;
                }
                mod.children.every(child => {
                    if (filenames.includes(child.filename)) {
                        removeWork.add(mod.filename);
                        removeList.add(mod.filename);
                        return false;
                    }
                    return true;
                });
            });
            if (removeWork.size) {
                findRelated(Array.from(removeWork));
            }
        };
        findRelated([filename]);
        removeList.forEach(fn => {
            let watching = this.watching;
            let callback = this.watching.get(fn);
            this.watching.delete(fn);
            delete require.cache[fn];
            fs.unwatchFile(fn);
            if (callback) {
                callback(fn);
            }
        });
    }
    /**
     * Print out what is being watched
     */
    printWatching() {
        console.log(this.watching.keys());
    }
}
exports.WatcherService = WatcherService;
//# sourceMappingURL=watcher.service.js.map
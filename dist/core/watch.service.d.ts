import { LogService } from './log.service';
/**
 * Watch service for watching file (controllers, services, and related files)
 */
export declare class WatchService {
    private kiteroot;
    private interval;
    /**
     * Watching list
     */
    private watching;
    /**
     * Is watching enabled
     */
    private enabled;
    private node_modules;
    logService: LogService;
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
    constructor(kiteroot: string, interval?: number);
    /**
     * Enable watching service
     */
    setEnabled(enabled: boolean): void;
    /**
     * Watch a file, if change detected, reload it
     *
     * Please note that this watcher is only works with node modules
     */
    watch(filename: string, callback?: (filename: string) => void): void;
    /**
     * Clear node require cache, it's also search for parent modules, if parent modules are being watched, remove them too
     * @param filename filename to clear
     */
    private clearCache(filename);
    /**
     * Print out what is being watched
     */
    printWatching(): void;
}

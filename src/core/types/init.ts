/***
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

/**
 * KiteInit interface
 * 
 * This interface is used in some places where need asynchronous initialization, such
 * as database(MySQL, MongoDB...) initialization, an injectable service connect to DB 
 * should initialize the connection while service object is created, so a controller 
 * which injected this service is able to query data smoothly on the first invocation.
 * 
 * But in most condition, DB connection is an asynchronous work, means we need a 
 * callback to receive something like "Pool" or "Connection", and stop processing if errors occured.
 * Since class constructor can not do asynchronous works (it can't return anything), 
 * so in this case, injectable services should implement `KiteInit`, do asynchronous
 * works in function `onKiteInit()`, Kite will wait initialize finished, and inject it to controller.
 */
export interface Init {
    /**
     * asynchronous initialization method,
     * if a service is implemented this function, it will be invoked after its injections
     * are successfully injected
     * 
     * @remark
     * Note this method must return a "Promise" object or declare with "async" modifier,
     * Please handle all exceptions, an exception may cause Kite crash
     */
    onKiteInit(): Promise<any>;
}

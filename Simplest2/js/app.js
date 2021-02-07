/*
 *      Copyright (c) 2016 Samsung Electronics Co., Ltd
 *
 *      Licensed under the Flora License, Version 1.1 (the "License");
 *      you may not use this file except in compliance with the License.
 *      You may obtain a copy of the License at
 *
 *              http://floralicense.org/license/
 *
 *      Unless required by applicable law or agreed to in writing, software
 *      distributed under the License is distributed on an "AS IS" BASIS,
 *      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *      See the License for the specific language governing permissions and
 *      limitations under the License.
 */

/*global moonphase */

/**
 * App.js controls main page display, including changes in date information.
 */
(function() {

    /**
     * Rotates the angle corresponding to the id.
     * @private
     * @param {number} angle
     * @param {string} id
     */
    function rotateElement(angle, id) {
        document.querySelector("#" + id).style.transform = "rotate(" + angle + "deg)";
    }

    /**
     * Updates the current time.
     * @private
     */
    function updateTime() {
        var datetime = tizen.time.getCurrentDateTime(),
            hour = datetime.getHours(),
            minute = datetime.getMinutes(),
            second = datetime.getSeconds();

        // update the hour/minute/second hands and shadows.
        rotateElement((hour + (minute / 60) + (second / 3600)) * 30, "body-hr-hand");
        rotateElement((hour + (minute / 60) + (second / 3600)) * 30, "body-hr-hand-shadow");
        rotateElement((minute + second / 60) * 6, "body-min-hand");
        rotateElement((minute + second / 60) * 6, "body-min-hand-shadow");
    }

    /**
     * Updates watch screen. (time, date and moon phase)
     */
    function updateWatch() {
        updateTime();
    }

    /**
     * Binds events.
     */
    function bindEvents() {
        // add eventListener to update the screen immediately when the device wakes up.
        document.addEventListener("visibilitychange", function() {
            if (!document.hidden) {
                updateWatch();
            }
        });

        // add event listeners to update watch screen when the time zone is changed.
        tizen.time.setTimezoneChangeListener(function() {
            updateWatch();
        });
    }

    /**
     * Initializes date, moon phase and time.
     * @private
     */
    function init() {
        setInterval(function() {
            updateTime();
        }, 1000);

        bindEvents();
    }

    window.onload = init();

}());
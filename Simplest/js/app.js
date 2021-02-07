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

/*jshint unused: vars*/

(function() {
    var canvas,
        ctx,
        clockRadius,
        isAmbientMode,
        animRequest,
        animTimeout;

    /**
     * Returns the current date by Tizen time API or javascript API.
     * @return {Object} The current datetime object.
     * @private
     */
    function getDate() {
        'use strict';

        var date;

        try {
            date = tizen.time.getCurrentDateTime();
        } catch (err) {
            date = new Date();
        }

        return date;
    }

    /**
     * Renders a dot with specific center, radius, and colors.
     * @param {number} centerX - X coordinate of the center.
     * @param {number} centerY - Y coordinate of the center.
     * @param {number} radius - The radius of the dot
     * @param {number} colorFill - The color of the inner area.
     * @param {number} colorStroke - The color of the outer line.
     * @param {number} widthStroke - The width of the outer line.
     * @private
     */
    function renderDot(centerX, centerY, radius, colorFill, colorStroke, widthStroke) {
        'use strict';

        ctx.save();
        // Assign the center of the clock to the middle of the canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Render 4 dots in a circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        if (colorFill) {
            ctx.fillStyle = colorFill;
            ctx.fill();
        }
        if (colorStroke && widthStroke) {
            ctx.strokeStyle = colorStroke;
            ctx.lineWidth = widthStroke;
            ctx.stroke();
        }
        ctx.closePath();

        ctx.restore();
}

    /**
     * Renders a needle with specific angle, radius and width.
     * @param {number} angle - The angle of the needle. (0 - 360)
     * @param {number} radius - The radius ratio of the needle. (0.0 - 1.0)
     * @param {number} width - The width of the needle.
     * @private
     */
    function renderNeedle(angle, radius, width) {
        'use strict';

        ctx.save();
        // Assign the center of the clock to the middle of the canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.lineWidth = width;
        ctx.strokeStyle = "#004FE1";
        ctx.moveTo(0, 0);
        ctx.lineTo(clockRadius * radius, 0);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }

    /**
     * Draws the watch layout of normal mode.
     * @private
     */
    function drawNormalWatch() {
        'use strict';

        // Import the current time
        var date = getDate(),
            hours = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds(),
            nextMove = 1000 - date.getMilliseconds();

        // Erase the previous time
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // remove
        // Render 3, 6, 9, 12 o'clock dots
//        for (i = 0; i < 4; i++) {
//            renderDot(
//                    clockRadius * 0.9 * Math.cos(i * Math.PI / 2),
//                    clockRadius * 0.9 * Math.sin(i * Math.PI / 2),
//                    3, "#999999"
//            );
//        }
        // Render hour needle
        renderNeedle(((hours + minutes / 60 + seconds / 3600) - 3) * Math.PI / 6, 0.58, 6);
        // Render minute needle
        renderNeedle(((minutes + seconds / 60) - 15) * Math.PI / 30, 0.80, 4);
        // Render center dot
        renderDot(0, 0, 8, "#000000", "#004FE1", 7);
        renderDot(0, 0, 7, "#004FE1", "#000000", 2);

        animTimeout = setTimeout(function() {
            animRequest = window.requestAnimationFrame(drawNormalWatch);
        }, nextMove);
    }

    /**
     * Draws the watch layout of ambient mode.
     * @private
     */
    function drawAmbientWatch() {
        'use strict';

        // Import the current time
        var date = getDate(),
            hours = date.getHours(),
            minutes = date.getMinutes(),
            seconds = date.getSeconds();

        // Erase the previous time
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Render hour needle
        renderNeedle(((hours + minutes / 60 + seconds / 3600) - 3) * Math.PI / 6, 0.55, 6);
        // Render minute needle
        renderNeedle(((minutes + seconds / 60) - 15) * Math.PI / 30, 0.75, 4);
        // Render center dot
        renderDot(0, 0, 7, "#000000", "#ffffff", 4);
    }

    /**
     * Activates a mode of the watch.
     * @param {string} mode - The mode of the watch to be activated.
     * @private
     */
    function activateMode(mode) {
        'use strict';

        // Stop the animation before mode changing
        if (animTimeout) {
            window.clearTimeout(animTimeout);
        }
        if (animRequest) {
            window.cancelAnimationFrame(animRequest);
        }

        switch (mode) {
            case "Ambient":
                // Normal -> Ambient
                isAmbientMode = true;
                drawAmbientWatch();

                break;
            case "Normal":
                // Ambient -> Normal
                isAmbientMode = false;
                animRequest = window.requestAnimationFrame(drawNormalWatch);

                break;
            default:
                break;
        }
    }

    /**
     * Sets default event listeners.
     * @private
     */
    function setDefaultEvents() {
        'use strict';

        // Add an eventListener for timetick
        window.addEventListener("timetick", drawAmbientWatch);

        // Add an eventListener for ambientmodechanged
        window.addEventListener("ambientmodechanged", function(e) {
            if (e.detail.ambientMode === true) {
                // Rendering ambient mode case
                activateMode("Ambient");
            } else {
                // Rendering normal case
                activateMode("Normal");
            }
        });

        // Add an event listener to update the screen immediately when the device wakes up
        document.addEventListener("visibilitychange", function() {
            if (!document.hidden) {
                if (isAmbientMode === true) {
                    // Rendering ambient mode case
                    activateMode("Ambient");
                } else {
                    // Rendering normal case
                    activateMode("Normal");
                }
            }
        });
    }

    /**
     * Sets default variables.
     * @private
     */
    function setDefaultVariables() {
        'use strict';

        canvas = document.querySelector("#canvas");
        ctx = canvas.getContext("2d");
        canvas.width = document.body.clientWidth;
        canvas.height = canvas.width;
        clockRadius = document.body.clientWidth / 2;

        isAmbientMode = false;
    }

    /**
     * Initiates the application.
     * @private
     */
    function init() {
        'use strict';

        setDefaultVariables();
        setDefaultEvents();

        animRequest = window.requestAnimationFrame(drawNormalWatch);
    }

    window.onload = init;
}());
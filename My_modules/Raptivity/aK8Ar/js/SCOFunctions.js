/*******************************************************************************
** 
***********************************************
Copyright © 2005-2013 Harbinger Knowledge Products
all rights reserved
***********************************************
** Filename: SCOFunctions.js
*******************************************************************************/
var startDate;
var exitPageStatus;
var flagfinish = false;
var trackProgress = true;
var gsComplStatus;

function loadPage() {
    doLMSInitialize();
    
    var status = doLMSGetValue('cmi.core.lesson_status');
    if (status === 'not attempted') {
        doLMSSetValue('cmi.core.lesson_status', 'incomplete');
    }

    exitPageStatus = false;
    startTimer();
}

function startTimer() {
    startDate = new Date().getTime();
}

function computeTime() {
    if (startDate != 0) {
        var currentDate = new Date().getTime();
        var elapsedSeconds = ((currentDate - startDate) / 1000);
        var formattedTime = convertTotalSeconds(elapsedSeconds);
    } else {
        formattedTime = '00:00:00';
    }

    doLMSSetValue('cmi.core.session_time', formattedTime);
}

function doQuit() {
    doLMSSetValue('cmi.core.exit', 'logout');

    computeTime();
    exitPageStatus = true;

    doLMSCommit();
    doLMSFinish();
}

function unloadPage() {
    if (!flagfinish) {
        if (exitPageStatus != true) {
            doQuit();
        } else {
            computeTime();
            doLMSCommit('');
            doLMSFinish('');
        }

        flagfinish = true;
    }
}

/*******************************************************************************
 ** this function will convert seconds into hours, minutes, and seconds in
 ** CMITimespan type format - HHHH:MM:SS.SS (Hours has a max of 4 digits &
 ** Min of 2 digits
 *******************************************************************************/

function convertTotalSeconds(ts) {
    var sec = (ts % 60);

    ts -= sec;
    var tmp = (ts % 3600); //# of seconds in the total # of minutes
    ts -= tmp; //# of seconds in the total # of hours

    // convert seconds to conform to CMITimespan type (e.g. SS.00)
    sec = Math.round(sec * 100) / 100;

    var strSec = new String(sec);
    var strWholeSec = strSec;
    var strFractionSec = '';

    if (strSec.indexOf('.') != -1) {
        strWholeSec = strSec.substring(0, strSec.indexOf('.'));
        strFractionSec = strSec.substring(strSec.indexOf('.') + 1, strSec.length);
    }

    if (strWholeSec.length < 2) {
        strWholeSec = '0' + strWholeSec;
    }
    strSec = strWholeSec;

    if (strFractionSec.length) {
        strSec = strSec + '.' + strFractionSec;
    }

    if ((ts % 3600) != 0) {
        var hour = 0;
    } else {
        var hour = (ts / 3600);
    }
    
    if ((tmp % 60) != 0) {
        var min = 0;
    } else {
        var min = (tmp / 60);
    }

    if ((new String(hour)).length < 2) {
        hour = '0' + hour;
    }
    
    if ((new String(min)).length < 2) {
        min = '0' + min;
    }

    var rtnVal = hour + ':' + min + ':' + strSec;

    return rtnVal;
}
### Copyright (c) 2015 Magnus Leo. All rights reserved. ###

util = {}
module.exports = util

util.KEY_CODES = {'BACKSPACE':8,'TAB':9,'ENTER':13,'SHIFT':16,'CTRL':17,'ALT':18,'PAUSE_BREAK':19,'CAPS_LOCK':20,'ESCAPE':27,'PAGE_UP':33,'PAGE_DOWN':34,'END':35,'HOME':36,'LEFT':37,'UP':38,'RIGHT':39,'DOWN':40,'INSERT':45,'DELETE':46,'0':48,'1':49,'2':50,'3':51,'4':52,'5':53,'6':54,'7':55,'8':56,'9':57,'A':65,'B':66,'C':67,'D':68,'E':69,'F':70,'G':71,'H':72,'I':73,'J':74,'K':75,'L':76,'M':77,'N':78,'O':79,'P':80,'Q':81,'R':82,'S':83,'T':84,'U':85,'V':86,'W':87,'X':88,'Y':89,'Z':90,'LEFT_WINDOW_KEY':91,'RIGHT_WINDOW_KEY':92,'SELECT_KEY':93,'NUMPAD_0':96,'NUMPAD_1':97,'NUMPAD_2':98,'NUMPAD_3':99,'NUMPAD_4':100,'NUMPAD_5':101,'NUMPAD_6':102,'NUMPAD_7':103,'NUMPAD_8':104,'NUMPAD_9':105,'MULTIPLY':106,'*':106,'ADD':107,'+':107,'SUBTRACT':109,'DECIMAL_POINT':110,'DIVIDE':111,'F1':112,'F2':113,'F3':114,'F4':115,'F5':116,'F6':117,'F7':118,'F8':119,'F9':120,'F10':121,'F11':122,'F12':123,'NUM_LOCK':144,'SCROLL_LOCK':145,'SEMI-COLON':186,';':186,'EQUAL_SIGN':187,'=':187,'COMMA':188,',':188,'DASH':189,'-':189,'PERIOD':190,'.':190,'FORWARD_SLASH':191,'/':191,'GRAVE_ACCENT':192,'OPEN_BRACKET':219,'[':219,'BACK_SLASH':220,'\\':220,'CLOSE_BRAKET':221,']':221,'SINGLE_QUOTE':222,'\'':222}

util.documentHidden = ->
    vendors = ['ms', 'moz', 'webkit', 'o']
    i = 0
    if document.hidden?
        return document.hidden

    for vendor in vendors
        if typeof document[vendor + 'Hidden'] isnt 'undefined'
            return document[vendor + 'Hidden']

    return false

util.merge = ->
    ret = {}
    for obj in arguments
        if typeof obj isnt 'object' or
        (obj instanceof Array)
            continue
        for name, val of obj
            ret[name] = val
    return ret
#!/usr/bin/env python
# -*- coding:utf-8 -*-
import sys
import os
import logging
from waveshare_epd import epd2in13_V2
import time
from PIL import Image,ImageDraw,ImageFont
import traceback

try:
    epd = epd2in13_V2.EPD()
    epd.init(epd.FULL_UPDATE)
    #epd.Clear(0xFF)
    time.sleep(2)
    image = Image.open('/tmp/rp0-bankbox-display.bmp')
    epd.display(epd.getbuffer(image))
    time.sleep(2)

except IOError as e:
    logging.info(e)
    
except KeyboardInterrupt:    
    logging.info("ctrl + c:")
    epd2in13_V2.epdconfig.module_exit()
    exit()

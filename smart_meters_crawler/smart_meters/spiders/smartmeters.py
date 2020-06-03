# -*- coding: utf-8 -*-
import scrapy
import json
import os

from smart_meters.items import SmartMetersItem

class SmartmetersSpider(scrapy.Spider):
    name = 'smartmeters'

    allowed_domains = ['portal.blogpv.net/api/']
    start_urls = ['https://portal.blogpv.net/api/enercity/assets']

    """custom_settings = {
        'FEED_URI': './output/smIDs.json',
        'FEED_FORMAT': 'json',
        'FEED_EXPORT_FIELDS': ["meterId"]
    }"""

    def parse(self, response):
        #item = SmartMetersItem()
        jsonresponse = json.loads(response.body_as_unicode())
        meterIDs = []
        for hh in range(0, len(jsonresponse["data"])):
            if(len(jsonresponse["data"][hh]) > 0):
                smId = str(jsonresponse["data"][hh]["meterId"])
                if(smId != "NO_METER_AVAILABLE"):
                    meterIDs.append(smId)
                    #self.log(meterIDs)
        with open(('../smIDs.json'), 'w') as filehandle:
            json.dump(meterIDs, filehandle)
        
        #item["meterId"] = meterIDs
        #yield item
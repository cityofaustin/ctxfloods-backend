const Client = require('pg').Client;

const { getPgResAsIncidentJson } = require('./wazeFeedHandler');

describe('wazeFeedHandler', () => {
  describe('getPgResAsIncidentJson', () => {
    it('should transform pg incident rows into the waze cifs json shape', () => {
      expect(
        getPgResAsIncidentJson([
          {
            waze_feed: {
              id: 1943,
              street: 'todo',
              polyline: '29.844137 -96.725288 29.844137 -96.725288',
              direction: 'BOTH_DIRECTIONS',
              type: 'ROAD_CLOSED',
              subtype: 'ROAD_CLOSED_HAZARD',
              starttime: '2018-06-21T12:00:35.222421',
              description: '',
              reference: 'CTXfloods',
            },
          },
          {
            waze_feed: {
              id: 1941,
              street: 'todo',
              polyline: '29.901161 -96.886971 29.901161 -96.886971',
              direction: 'BOTH_DIRECTIONS',
              type: 'HAZARD',
              subtype: 'HAZARD_WEATHER_FLOOD',
              starttime: '2018-06-21T12:00:31.154284',
              description: '',
              reference: 'CTXfloods',
            },
          },
          {
            waze_feed: {
              id: 1942,
              street: 'todo',
              polyline: '29.880667 -96.655914 29.880667 -96.655914',
              direction: 'BOTH_DIRECTIONS',
              type: 'ROAD_CLOSED',
              subtype: 'ROAD_CLOSED_HAZARD',
              starttime: '2018-06-21T12:00:32.759357',
              description: '',
              reference: 'CTXfloods',
            },
          },
        ]),
      ).toMatchSnapshot();
    });
  });
});

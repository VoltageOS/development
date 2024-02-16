/*
 * Copyright (C) 2023 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {assertDefined} from 'common/assert_utils';
import {TimestampType} from 'common/time';
import {NO_TIMEZONE_OFFSET_FACTORY} from 'common/timestamp_factory';
import {UnitTestUtils} from 'test/unit/utils';
import {Parser} from 'trace/parser';
import {TraceType} from 'trace/trace_type';
import {PropertyTreeNode} from 'trace/tree_node/property_tree_node';

describe('WmFileParserTransitions', () => {
  let parser: Parser<PropertyTreeNode>;

  beforeAll(async () => {
    jasmine.addCustomEqualityTester(UnitTestUtils.timestampEqualityTester);
    parser = (await UnitTestUtils.getParser(
      'traces/elapsed_and_real_timestamp/wm_transition_trace.pb'
    )) as Parser<PropertyTreeNode>;
  });

  it('has expected trace type', () => {
    expect(parser.getTraceType()).toEqual(TraceType.WM_TRANSITION);
  });

  it('provides elapsed timestamps', () => {
    const timestamps = assertDefined(parser.getTimestamps(TimestampType.ELAPSED));
    expect(timestamps.length).toEqual(8);
    const expected = NO_TIMEZONE_OFFSET_FACTORY.makeElapsedTimestamp(0n);
    timestamps.forEach((timestamp) => expect(timestamp).toEqual(expected));
  });

  it('provides real timestamps', () => {
    const timestamps = assertDefined(parser.getTimestamps(TimestampType.REAL));
    expect(timestamps.length).toEqual(8);
    const expected = NO_TIMEZONE_OFFSET_FACTORY.makeRealTimestamp(1683130827956652323n);
    timestamps.forEach((timestamp) => expect(timestamp).toEqual(expected));
  });

  it('applies timezone info to real timestamps only', async () => {
    const parserWithTimezoneInfo = (await UnitTestUtils.getParser(
      'traces/elapsed_and_real_timestamp/wm_transition_trace.pb',
      true
    )) as Parser<PropertyTreeNode>;
    expect(parserWithTimezoneInfo.getTraceType()).toEqual(TraceType.WM_TRANSITION);

    expect(assertDefined(parserWithTimezoneInfo.getTimestamps(TimestampType.ELAPSED))[0]).toEqual(
      NO_TIMEZONE_OFFSET_FACTORY.makeElapsedTimestamp(0n)
    );
    expect(assertDefined(parserWithTimezoneInfo.getTimestamps(TimestampType.REAL))[0]).toEqual(
      NO_TIMEZONE_OFFSET_FACTORY.makeRealTimestamp(1683150627956652323n)
    );
  });
});

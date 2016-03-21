import * as Utils from './utils';
import * as Lexer from './lexer';
import * as NameOrIdentifier from './nameOrIdentifier';

export function nullValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (Utils.equals(value, index, 'null')) return Lexer.tokenize(value, index, index + 4, 'null', Lexer.TokenType.Literal);
}
export function booleanValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (Utils.equals(value, index, 'true')) return Lexer.tokenize(value, index, index + 4, 'Edm.Boolean', Lexer.TokenType.Literal);
	if (Utils.equals(value, index, 'false')) return Lexer.tokenize(value, index, index + 5, 'Edm.Boolean', Lexer.TokenType.Literal);
}
export function guidValue(value, index) {
	if (Utils.required(value, index, Lexer.HEXDIG, 8, 8) &&
		value[index + 8] == 0x2d &&
		Utils.required(value, index + 9, Lexer.HEXDIG, 4, 4) &&
		value[index + 13] == 0x2d &&
		Utils.required(value, index + 14, Lexer.HEXDIG, 4, 4) &&
		value[index + 18] == 0x2d &&
		Utils.required(value, index + 19, Lexer.HEXDIG, 4, 4) &&
		value[index + 23] == 0x2d &&
		Utils.required(value, index + 24, Lexer.HEXDIG, 12)) return Lexer.tokenize(value, index, index + 36, 'Edm.Guid', Lexer.TokenType.Literal);
}
export function sbyteValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Lexer.SIGN(value[index])) index++;
	var next = Utils.required(value, index, Lexer.DIGIT, 1, 3);
	if (next) {
		if (Lexer.DIGIT(value[next])) return;
		var val = parseInt(Utils.stringify(value, start, next), 10);
		if (val >= -128 && val <= 127) return Lexer.tokenize(value, start, next, 'Edm.SByte', Lexer.TokenType.Literal);
	}
}
export function byteValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	var next = Utils.required(value, index, Lexer.DIGIT, 1, 3);
	if (next) {
		if (Lexer.DIGIT(value[next])) return;
		var val = parseInt(Utils.stringify(value, index, next), 10);
		if (val >= 0 && val <= 255) return Lexer.tokenize(value, index, next, 'Edm.Byte', Lexer.TokenType.Literal);
	}
}
export function int16Value(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Lexer.SIGN(value[index])) index++;
	var next = Utils.required(value, index, Lexer.DIGIT, 1, 5);
	if (next) {
		if (Lexer.DIGIT(value[next])) return;
		var val = parseInt(Utils.stringify(value, start, next), 10);
		if (val >= -32768 && val <= 32767) return Lexer.tokenize(value, start, next, 'Edm.Int16', Lexer.TokenType.Literal);
	}
}
export function int32Value(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Lexer.SIGN(value[index])) index++;
	var next = Utils.required(value, index, Lexer.DIGIT, 1, 10);
	if (next) {
		if (Lexer.DIGIT(value[next])) return;
		var val = parseInt(Utils.stringify(value, start, next), 10);
		if (val >= -2147483648 && val <= 2147483647) return Lexer.tokenize(value, start, next, 'Edm.Int32', Lexer.TokenType.Literal);
	}
}
export function int64Value(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Lexer.SIGN(value[index])) index++;
	var next = Utils.required(value, index, Lexer.DIGIT, 1, 19);
	if (next) {
		if (Lexer.DIGIT(value[next])) return;
		var val = Utils.stringify(value, index, next);
		if (val >= '0' && val <= (value[start] == 0x2d ? '9223372036854775808' : '9223372036854775807')) return Lexer.tokenize(value, start, next, 'Edm.Int64', Lexer.TokenType.Literal);
	}
}
export function decimalValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Lexer.SIGN(value[index])) index++;
	var intNext = Utils.required(value, index, Lexer.DIGIT, 1);
	if (!intNext) return;

	var end = intNext;
	if (value[intNext] == 0x2e) {
		end = Utils.required(value, intNext + 1, Lexer.DIGIT, 1);
		if (!end || end == intNext + 1) return;
	} else return;

	//TODO: detect only decimal value, no double/single detection here
	if (value[end] == 0x65) return;

	return Lexer.tokenize(value, start, end, 'Edm.Decimal', Lexer.TokenType.Literal);
}
export function doubleValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	var end = index;
	var nanInfLen = Lexer.nanInfinity(value, index);
	if (nanInfLen) {
		end += nanInfLen;
	} else {
		//TODO: use decimalValue function
		//var token = decimalValue(value, index);
		if (Lexer.SIGN(value[index])) index++;
		var intNext = Utils.required(value, index, Lexer.DIGIT, 1);
		if (!intNext) return;

		var decimalNext = intNext;
		if (value[intNext] == 0x2e) {
			decimalNext = Utils.required(value, intNext + 1, Lexer.DIGIT, 1);
			if (decimalNext == intNext + 1) return;
		} else return;

		if (value[decimalNext] == 0x65) {
			var next = decimalNext + 1;
			if (Lexer.SIGN(value[next])) next++;
			var digitNext = Utils.required(value, next, Lexer.DIGIT, 1);
			if (digitNext) {
				end = digitNext;
			}
		} else end = decimalNext;
	}

	return Lexer.tokenize(value, start, end, 'Edm.Double', Lexer.TokenType.Literal);
}
export function singleValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	var token = doubleValue(value, index);
	if (token) {
		token.value = 'Edm.Single';
	}
	return token;
}
export function stringValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (Lexer.SQUOTE(value[start])) {
		index++;
		var val = [];
		while (index < value.length) {
			var ch = value[index];
			var nextIndex = index + 1;
			var next = value[nextIndex];

			if (Lexer.SQUOTE(ch)) {
				index++;
				if (!Lexer.SQUOTE(next)) {
					if (Lexer.pcharNoSQUOTE(value, next) > index && !Lexer.CLOSE(value[index]) && Lexer.RWS(value, index) == index) return;
					break;
				} else {
					ch = 0x27;
					nextIndex++;
				}
			} else {
				nextIndex = Math.max(Lexer.RWS(value, index), Lexer.pcharNoSQUOTE(value, index));
				if (nextIndex == index) return;
			}

			index = nextIndex;
			val.push(ch);
		}
		if (!Lexer.SQUOTE(value[index - 1])) return;

		return Lexer.tokenize(value, start, index, 'Edm.String', Lexer.TokenType.Literal);
	}
}
export function durationValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (!Utils.equals(value, index, 'duration')) return;
	var start = index;
	index += 8;
	if (!Lexer.SQUOTE(value[index])) return;
	index++;
	if (Lexer.SIGN(value[index])) index++;
	if (value[index] != 0x50) return;
	index++;
	var dayNext = Utils.required(value, index, Lexer.DIGIT, 1);
	if (dayNext == index && value[index + 1] != 0x54) return;
	index = dayNext;
	if (value[index] == 0x44) index++;
	var end = index;
	if (value[index] == 0x54) {
		index++;
		var parseTimeFn = function () {
			if (Lexer.SQUOTE(value[index])) return index;
			var digitNext = Utils.required(value, index, Lexer.DIGIT, 1);
			if (digitNext == index) return;
			index = digitNext;
			if (value[index] == 0x53) {
				end = index + 1;
				return end;
			} else if (value[index] == 0x2e) {
				index++;
				var fractionalSecondsNext = Utils.required(value, index, Lexer.DIGIT, 1);
				if (fractionalSecondsNext == index || value[fractionalSecondsNext] != 0x53) return;
				end = fractionalSecondsNext + 1;
				return end;
			} else if (value[index] == 0x48) {
				index++;
				end = index;
				return parseTimeFn();
			} else if (value[index] == 0x4d) {
				index++;
				end = index;
				return parseTimeFn();
			}
		};
		var next = parseTimeFn();
		if (!next) return;
	}
	if (!Lexer.SQUOTE(value[end])) return;
	end++;

	return Lexer.tokenize(value, start, end, 'Edm.Duration', Lexer.TokenType.Literal);
}
export function binaryValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	var start = index;
	if (!Utils.equals(value, index, 'binary')) return;
	index += 6;
	if (!Lexer.SQUOTE(value[index])) return;
	index++;

	var valStart = index;
	while (index < value.length && !Lexer.SQUOTE(value[index])) {
		var end = Math.max(Lexer.base64b16(value, index), Lexer.base64b8(value, index));
		if (end > index) index = end;
		else if (Lexer.base64char(value[index]) &&
			Lexer.base64char(value[index + 1]) &&
			Lexer.base64char(value[index + 2]) &&
			Lexer.base64char(value[index + 3])) index += 4;
		else index++;
	}
	index++;

	return Lexer.tokenize(value, start, index, 'Edm.Binary' /*new Edm.Binary(stringify(value, valStart, index - 1))*/, Lexer.TokenType.Literal);
}
export function dateValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	var yearNext = Lexer.year(value, index);
	if (yearNext == index || value[yearNext] != 0x2d) return;
	var monthNext = Lexer.month(value, yearNext + 1);
	if ((monthNext == yearNext + 1) || value[monthNext] != 0x2d) return;
	var dayNext = Lexer.day(value, monthNext + 1);
	//TODO: join dateValue and dateTimeOffsetValue for optimalization
	if (dayNext == monthNext + 1 || value[dayNext] == 0x54) return;
	return Lexer.tokenize(value, index, dayNext, 'Edm.Date', Lexer.TokenType.Literal);
}
export function dateTimeOffsetValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	var yearNext = Lexer.year(value, index);
	if (yearNext == index || value[yearNext] != 0x2d) return;
	var monthNext = Lexer.month(value, yearNext + 1);
	if ((monthNext == yearNext + 1) || value[monthNext] != 0x2d) return;
	var dayNext = Lexer.day(value, monthNext + 1);
	if (dayNext == monthNext + 1 || value[dayNext] != 0x54) return;
	var hourNext = Lexer.hour(value, dayNext + 1);
	if (hourNext == dayNext + 1 || !Lexer.COLON(value[hourNext])) return;
	var minuteNext = Lexer.minute(value, hourNext + 1);
	if (minuteNext == hourNext + 1) return;

	var end = minuteNext;
	if (Lexer.COLON(value[minuteNext])) {
		var secondNext = Lexer.second(value, minuteNext + 1);
		if (secondNext == minuteNext + 1) return;
		if (value[secondNext] == 0x2e) {
			var fractionalSecondsNext = Lexer.fractionalSeconds(value, secondNext + 1);
			if (fractionalSecondsNext == secondNext + 1) return;
			end = fractionalSecondsNext;
		} else end = secondNext;
	}

	if (value[end] == 0x5a) {
		end++;
	} else if (Lexer.SIGN(value[end])) {
		var zHourNext = Lexer.hour(value, end + 1);
		if (zHourNext == end + 1 || !Lexer.COLON(zHourNext)) return;
		var zMinuteNext = Lexer.minute(value, zHourNext + 1);
		if (zMinuteNext == zHourNext + 1) return;
	} else return;

	return Lexer.tokenize(value, index, end, 'Edm.DateTimeOffset', Lexer.TokenType.Literal);
}
export function timeOfDayValue(value:number[] | Uint8Array, index:number):Lexer.Token {
	var hourNext = Lexer.hour(value, index);
	if (hourNext == index || !Lexer.COLON(value[hourNext])) return;
	var minuteNext = Lexer.minute(value, hourNext + 1);
	if (minuteNext == hourNext + 1) return;

	var end = minuteNext;
	if (Lexer.COLON(value[minuteNext])) {
		var secondNext = Lexer.second(value, minuteNext + 1);
		if (secondNext == minuteNext + 1) return;
		if (value[secondNext] == 0x2e) {
			var fractionalSecondsNext = Lexer.fractionalSeconds(value, secondNext + 1);
			if (fractionalSecondsNext == secondNext + 1) return;
			end = fractionalSecondsNext;
		} else end = secondNext;
	}

	return Lexer.tokenize(value, index, end, 'Edm.TimeOfDay', Lexer.TokenType.Literal);
}

// geography and geometry literals
export function positionLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	var longitude = doubleValue(value, index);
	if (!longitude) return;

	if (!Lexer.SP(value[longitude.next])) return;

	var latitude = doubleValue(value, longitude.next + 1);
	if (!latitude) return;

	return Lexer.tokenize(value, index, latitude.next, { longitude, latitude }, Lexer.TokenType.Literal);
}
export function pointData(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (!Lexer.OPEN(value[index])) return;
	var start = index;
	index++;

	var position = positionLiteral(value, index);
	if (!position) return;
	index = position.next;

	if (!Lexer.CLOSE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, position, Lexer.TokenType.Literal);
}
export function lineStringData(value:number[] | Uint8Array, index:number):Lexer.Token {
	return multiGeoLiteralFactory(value, index, '', positionLiteral);
}
export function ringLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	return multiGeoLiteralFactory(value, index, '', positionLiteral);
	// Within each ringLiteral, the first and last positionLiteral elements MUST be an exact syntactic match to each other.
	// Within the polygonData, the ringLiterals MUST specify their points in appropriate winding order.
	// In order of traversal, points to the left side of the ring are interpreted as being in the polygon.
}
export function polygonData(value:number[] | Uint8Array, index:number):Lexer.Token {
	return multiGeoLiteralFactory(value, index, '', ringLiteral);
}
export function sridLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (!Utils.equals(value, index, 'SRID')) return;
	var start = index;
	index += 4;

	if (!Lexer.EQ(value[index])) return;
	index++;

	var digit = Utils.required(value, index, Lexer.DIGIT, 1, 5);
	if (!digit) return;
	index = digit;

	if (!Lexer.SEMI(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, 'SRID', Lexer.TokenType.Literal);
}
export function pointLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (!Utils.equals(value, index, 'Point')) return;
	var start = index;
	index += 5;

	var data = pointData(value, index);
	if (!data) return;

	return Lexer.tokenize(value, start, data.next, data, Lexer.TokenType.Literal);
}
export function polygonLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (!Utils.equals(value, index, 'Polygon')) return;
	var start = index;
	index += 7;

	var data = polygonData(value, index);
	if (!data) return;

	return Lexer.tokenize(value, start, data.next, data, Lexer.TokenType.Literal);
}
export function collectionLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	return multiGeoLiteralFactory(value, index, 'Collection', geoLiteral);
}
export function lineStringLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	if (!Utils.equals(value, index, 'LineString')) return;
	var start = index;
	index += 10;

	var data = lineStringData(value, index);
	if (!data) return;
	index = data.next;

	return Lexer.tokenize(value, start, index, data, Lexer.TokenType.Literal);
}
export function multiLineStringLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	return multiGeoLiteralOptionalFactory(value, index, 'MultiLineString', lineStringData);
}
export function multiPointLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	return multiGeoLiteralOptionalFactory(value, index, 'MultiPoint', pointData);
}
export function multiPolygonLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	return multiGeoLiteralOptionalFactory(value, index, 'MultiPolygon', polygonData);
}
export function multiGeoLiteralFactory(value:number[] | Uint8Array, index:number, prefix:string, itemLiteral:Function):Lexer.Token {
	if (!Utils.equals(value, index, prefix + '(')) return;
	var start = index;
	index += prefix.length + 1;

	var items = [];
	var geo = itemLiteral(value, index);
	if (!geo) return;
	index = geo.next;

	while (geo){
		items.push(geo);

		if (Lexer.CLOSE(value[index])){
			index++;
			break;
		}
		if (!Lexer.COMMA(value[index])) return;
		index++;

		geo = itemLiteral(value, index);
		if (!geo) return;
		index = geo.next;
	}

	return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Literal);
}
export function multiGeoLiteralOptionalFactory(value:number[] | Uint8Array, index:number, prefix:string, itemLiteral:Function):Lexer.Token {
	if (!Utils.equals(value, index, prefix + '(')) return;
	var start = index;
	index += prefix.length + 1;

	var items = [];
	if (!Lexer.CLOSE(value[index])){
		var geo = itemLiteral(value, index);
		if (!geo) return;
		index = geo.next;

		while (geo){
			items.push(geo);

			if (Lexer.CLOSE(value[index])){
				index++;
				break;
			}
			if (!Lexer.COMMA(value[index])) return;
			index++;

			geo = itemLiteral(value, index);
			if (!geo) return;
			index = geo.next;
		}
	}else index++;

	return Lexer.tokenize(value, start, index, { items }, Lexer.TokenType.Literal);
}
export function geoLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	return collectionLiteral(value, index) ||
		lineStringLiteral(value, index) ||
		multiPointLiteral(value, index) ||
		multiLineStringLiteral(value, index) ||
		multiPolygonLiteral(value, index) ||
		pointLiteral(value, index) ||
		polygonLiteral(value, index);
}
export function fullPointLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	return fullGeoLiteralFactory(value, index, pointLiteral);
}
export function fullCollectionLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	return fullGeoLiteralFactory(value, index, collectionLiteral);
}
export function fullLineStringLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	return fullGeoLiteralFactory(value, index, lineStringLiteral);
}
export function fullMultiLineStringLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	return fullGeoLiteralFactory(value, index, multiLineStringLiteral);
}
export function fullMultiPointLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	return fullGeoLiteralFactory(value, index, multiPointLiteral);
}
export function fullMultiPolygonLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	return fullGeoLiteralFactory(value, index, multiPolygonLiteral);
}
export function fullPolygonLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	return fullGeoLiteralFactory(value, index, polygonLiteral);
}
export function fullGeoLiteralFactory(value:number[] | Uint8Array, index:number, literal:Function){
	var srid = sridLiteral(value, index);
	if (!srid) return;

	var token = literal(value, srid.next);
	if (!token) return;

	return Lexer.tokenize(value, index, token.next, { srid, value: token }, Lexer.TokenType.Literal);
}

export function geographyCollection(value:number[] | Uint8Array, index:number):Lexer.Token {
	var prefix = Lexer.geographyPrefix(value, index);
	if (prefix == index) return;
	var start = index;
	index = prefix;

	if (!Lexer.SQUOTE(value[index])) return;
	index++;

	var point = fullCollectionLiteral(value, index);
	if (!point) return;
	index = point.next;

	if (!Lexer.SQUOTE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, 'Edm.GeographyCollection', Lexer.TokenType.Literal);
}
export function geographyLineString(value:number[] | Uint8Array, index:number):Lexer.Token {
	return geoLiteralFactory(value, index, 'Edm.GeographyLineString', Lexer.geographyPrefix, fullLineStringLiteral);
}
export function geographyMultiLineString(value:number[] | Uint8Array, index:number):Lexer.Token {
	return geoLiteralFactory(value, index, 'Edm.GeographyMultiLineString', Lexer.geographyPrefix, fullMultiLineStringLiteral);
}
export function geographyMultiPoint(value:number[] | Uint8Array, index:number):Lexer.Token {
	return geoLiteralFactory(value, index, 'Edm.GeographyMultiPoint', Lexer.geographyPrefix, fullMultiPointLiteral);
}
export function geographyMultiPolygon(value:number[] | Uint8Array, index:number):Lexer.Token {
	return geoLiteralFactory(value, index, 'Edm.GeographyMultiPolygon', Lexer.geographyPrefix, fullMultiPolygonLiteral);
}
export function geographyPoint(value:number[] | Uint8Array, index:number):Lexer.Token {
	return geoLiteralFactory(value, index, 'Edm.GeographyPoint', Lexer.geographyPrefix, fullPointLiteral);
}
export function geographyPolygon(value:number[] | Uint8Array, index:number):Lexer.Token {
	return geoLiteralFactory(value, index, 'Edm.GeographyPolygon', Lexer.geographyPrefix, fullPolygonLiteral);
}
export function geometryCollection(value:number[] | Uint8Array, index:number):Lexer.Token {
	return geoLiteralFactory(value, index, 'Edm.GeometryCollection', Lexer.geometryPrefix, fullCollectionLiteral);
}
export function geometryLineString(value:number[] | Uint8Array, index:number):Lexer.Token {
	return geoLiteralFactory(value, index, 'Edm.GeometryLineString', Lexer.geometryPrefix, fullLineStringLiteral);
}
export function geometryMultiLineString(value:number[] | Uint8Array, index:number):Lexer.Token {
	return geoLiteralFactory(value, index, 'Edm.GeometryMultiLineString', Lexer.geometryPrefix, fullMultiLineStringLiteral);
}
export function geometryMultiPoint(value:number[] | Uint8Array, index:number):Lexer.Token {
	return geoLiteralFactory(value, index, 'Edm.GeometryMultiPoint', Lexer.geometryPrefix, fullMultiPointLiteral);
}
export function geometryMultiPolygon(value:number[] | Uint8Array, index:number):Lexer.Token {
	return geoLiteralFactory(value, index, 'Edm.GeometryMultiPolygon', Lexer.geometryPrefix, fullMultiPolygonLiteral);
}
export function geometryPoint(value:number[] | Uint8Array, index:number):Lexer.Token {
	return geoLiteralFactory(value, index, 'Edm.GeometryPoint', Lexer.geometryPrefix, fullPointLiteral);
}
export function geometryPolygon(value:number[] | Uint8Array, index:number):Lexer.Token {
	return geoLiteralFactory(value, index, 'Edm.GeometryPolygon', Lexer.geometryPrefix, fullPolygonLiteral);
}
export function geoLiteralFactory(value:number[] | Uint8Array, index:number, type:string, prefix:Function, literal:Function):Lexer.Token {
	var prefixNext = prefix(value, index);
	if (prefixNext == index) return;
	var start = index;
	index = prefixNext;

	if (!Lexer.SQUOTE(value[index])) return;
	index++;

	var data = literal(value, index);
	if (!data) return;
	index = data.next;

	if (!Lexer.SQUOTE(value[index])) return;
	index++;

	return Lexer.tokenize(value, start, index, type, Lexer.TokenType.Literal);
}

export function primitiveLiteral(value:number[] | Uint8Array, index:number):Lexer.Token {
	return nullValue(value, index) ||
		booleanValue(value, index) ||
		guidValue(value, index) ||
		dateValue(value, index) ||
		dateTimeOffsetValue(value, index) ||
		timeOfDayValue(value, index) ||
		decimalValue(value, index) ||
		doubleValue(value, index) ||
		singleValue(value, index) ||
		sbyteValue(value, index) ||
		byteValue(value, index) ||
		int16Value(value, index) ||
		int32Value(value, index) ||
		int64Value(value, index) ||
		stringValue(value, index) ||
		durationValue(value, index) ||
		binaryValue(value, index) ||
		NameOrIdentifier.enumeration(value, index) ||
		geographyCollection(value, index) ||
		geographyLineString(value, index) ||
		geographyMultiLineString(value, index) ||
		geographyMultiPoint(value, index) ||
		geographyMultiPolygon(value, index) ||
		geographyPoint(value, index) ||
		geographyPolygon(value, index) ||
		geometryCollection(value, index) ||
		geometryLineString(value, index) ||
		geometryMultiLineString(value, index) ||
		geometryMultiPoint(value, index) ||
		geometryMultiPolygon(value, index) ||
		geometryPoint(value, index) ||
		geometryPolygon(value, index);
}

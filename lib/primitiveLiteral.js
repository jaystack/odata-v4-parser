"use strict";
var Utils = require('./utils');
var Lexer = require('./lexer');
var NameOrIdentifier = require('./nameOrIdentifier');
function nullValue(value, index) {
    if (Utils.equals(value, index, 'null'))
        return Lexer.tokenize(value, index, index + 4, 'null', Lexer.TokenType.Literal);
}
exports.nullValue = nullValue;
function booleanValue(value, index) {
    if (Utils.equals(value, index, 'true'))
        return Lexer.tokenize(value, index, index + 4, 'Edm.Boolean', Lexer.TokenType.Literal);
    if (Utils.equals(value, index, 'false'))
        return Lexer.tokenize(value, index, index + 5, 'Edm.Boolean', Lexer.TokenType.Literal);
}
exports.booleanValue = booleanValue;
function guidValue(value, index) {
    if (Utils.required(value, index, Lexer.HEXDIG, 8, 8) &&
        value[index + 8] == 0x2d &&
        Utils.required(value, index + 9, Lexer.HEXDIG, 4, 4) &&
        value[index + 13] == 0x2d &&
        Utils.required(value, index + 14, Lexer.HEXDIG, 4, 4) &&
        value[index + 18] == 0x2d &&
        Utils.required(value, index + 19, Lexer.HEXDIG, 4, 4) &&
        value[index + 23] == 0x2d &&
        Utils.required(value, index + 24, Lexer.HEXDIG, 12))
        return Lexer.tokenize(value, index, index + 36, 'Edm.Guid', Lexer.TokenType.Literal);
}
exports.guidValue = guidValue;
function sbyteValue(value, index) {
    var start = index;
    var sign = Lexer.SIGN(value, index);
    if (sign)
        index = sign;
    var next = Utils.required(value, index, Lexer.DIGIT, 1, 3);
    if (next) {
        if (Lexer.DIGIT(value[next]))
            return;
        var val = parseInt(Utils.stringify(value, start, next), 10);
        if (val >= -128 && val <= 127)
            return Lexer.tokenize(value, start, next, 'Edm.SByte', Lexer.TokenType.Literal);
    }
}
exports.sbyteValue = sbyteValue;
function byteValue(value, index) {
    var next = Utils.required(value, index, Lexer.DIGIT, 1, 3);
    if (next) {
        if (Lexer.DIGIT(value[next]))
            return;
        var val = parseInt(Utils.stringify(value, index, next), 10);
        if (val >= 0 && val <= 255)
            return Lexer.tokenize(value, index, next, 'Edm.Byte', Lexer.TokenType.Literal);
    }
}
exports.byteValue = byteValue;
function int16Value(value, index) {
    var start = index;
    var sign = Lexer.SIGN(value, index);
    if (sign)
        index = sign;
    var next = Utils.required(value, index, Lexer.DIGIT, 1, 5);
    if (next) {
        if (Lexer.DIGIT(value[next]))
            return;
        var val = parseInt(Utils.stringify(value, start, next), 10);
        if (val >= -32768 && val <= 32767)
            return Lexer.tokenize(value, start, next, 'Edm.Int16', Lexer.TokenType.Literal);
    }
}
exports.int16Value = int16Value;
function int32Value(value, index) {
    var start = index;
    var sign = Lexer.SIGN(value, index);
    if (sign)
        index = sign;
    var next = Utils.required(value, index, Lexer.DIGIT, 1, 10);
    if (next) {
        if (Lexer.DIGIT(value[next]))
            return;
        var val = parseInt(Utils.stringify(value, start, next), 10);
        if (val >= -2147483648 && val <= 2147483647)
            return Lexer.tokenize(value, start, next, 'Edm.Int32', Lexer.TokenType.Literal);
    }
}
exports.int32Value = int32Value;
function int64Value(value, index) {
    var start = index;
    var sign = Lexer.SIGN(value, index);
    if (sign)
        index = sign;
    var next = Utils.required(value, index, Lexer.DIGIT, 1, 19);
    if (next) {
        if (Lexer.DIGIT(value[next]))
            return;
        var val = Utils.stringify(value, index, next);
        if (val >= '0' && val <= (value[start] == 0x2d ? '9223372036854775808' : '9223372036854775807'))
            return Lexer.tokenize(value, start, next, 'Edm.Int64', Lexer.TokenType.Literal);
    }
}
exports.int64Value = int64Value;
function decimalValue(value, index) {
    var start = index;
    var sign = Lexer.SIGN(value, index);
    if (sign)
        index = sign;
    var intNext = Utils.required(value, index, Lexer.DIGIT, 1);
    if (!intNext)
        return;
    var end = intNext;
    if (value[intNext] == 0x2e) {
        end = Utils.required(value, intNext + 1, Lexer.DIGIT, 1);
        if (!end || end == intNext + 1)
            return;
    }
    else
        return;
    //TODO: detect only decimal value, no double/single detection here
    if (value[end] == 0x65)
        return;
    return Lexer.tokenize(value, start, end, 'Edm.Decimal', Lexer.TokenType.Literal);
}
exports.decimalValue = decimalValue;
function doubleValue(value, index) {
    var start = index;
    var end = index;
    var nanInfLen = Lexer.nanInfinity(value, index);
    if (nanInfLen) {
        end += nanInfLen;
    }
    else {
        //TODO: use decimalValue function
        //var token = decimalValue(value, index);
        var sign = Lexer.SIGN(value, index);
        if (sign)
            index = sign;
        var intNext = Utils.required(value, index, Lexer.DIGIT, 1);
        if (!intNext)
            return;
        var decimalNext = intNext;
        if (value[intNext] == 0x2e) {
            decimalNext = Utils.required(value, intNext + 1, Lexer.DIGIT, 1);
            if (decimalNext == intNext + 1)
                return;
        }
        else
            return;
        if (value[decimalNext] == 0x65) {
            var next = decimalNext + 1;
            var sign = Lexer.SIGN(value, next);
            if (sign)
                next = sign;
            var digitNext = Utils.required(value, next, Lexer.DIGIT, 1);
            if (digitNext) {
                end = digitNext;
            }
        }
        else
            end = decimalNext;
    }
    return Lexer.tokenize(value, start, end, 'Edm.Double', Lexer.TokenType.Literal);
}
exports.doubleValue = doubleValue;
function singleValue(value, index) {
    var token = doubleValue(value, index);
    if (token) {
        token.value = 'Edm.Single';
    }
    return token;
}
exports.singleValue = singleValue;
function stringValue(value, index) {
    var start = index;
    var squote = Lexer.SQUOTE(value, start);
    if (squote) {
        index = squote;
        while (index < value.length) {
            squote = Lexer.SQUOTE(value, index);
            if (squote) {
                index = squote;
                squote = Lexer.SQUOTE(value, index);
                if (!squote) {
                    var close = Lexer.CLOSE(value, index);
                    var comma = Lexer.COMMA(value, index);
                    var amp = value[index] == 0x26;
                    if (Lexer.pcharNoSQUOTE(value, index) > index && !amp && !close && !comma && Lexer.RWS(value, index) == index)
                        return;
                    break;
                }
                else {
                    index = squote;
                }
            }
            else {
                var nextIndex = Math.max(Lexer.RWS(value, index), Lexer.pcharNoSQUOTE(value, index));
                if (nextIndex == index)
                    return;
                index = nextIndex;
            }
        }
        squote = Lexer.SQUOTE(value, index - 1) || Lexer.SQUOTE(value, index - 3);
        if (!squote)
            return;
        index = squote;
        return Lexer.tokenize(value, start, index, 'Edm.String', Lexer.TokenType.Literal);
    }
}
exports.stringValue = stringValue;
function durationValue(value, index) {
    if (!Utils.equals(value, index, 'duration'))
        return;
    var start = index;
    index += 8;
    var squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    var sign = Lexer.SIGN(value, index);
    if (sign)
        index = sign;
    if (value[index] != 0x50)
        return;
    index++;
    var dayNext = Utils.required(value, index, Lexer.DIGIT, 1);
    if (dayNext == index && value[index + 1] != 0x54)
        return;
    index = dayNext;
    if (value[index] == 0x44)
        index++;
    var end = index;
    if (value[index] == 0x54) {
        index++;
        var parseTimeFn = function () {
            var squote = Lexer.SQUOTE(value, index);
            if (squote)
                return index;
            var digitNext = Utils.required(value, index, Lexer.DIGIT, 1);
            if (digitNext == index)
                return;
            index = digitNext;
            if (value[index] == 0x53) {
                end = index + 1;
                return end;
            }
            else if (value[index] == 0x2e) {
                index++;
                var fractionalSecondsNext = Utils.required(value, index, Lexer.DIGIT, 1);
                if (fractionalSecondsNext == index || value[fractionalSecondsNext] != 0x53)
                    return;
                end = fractionalSecondsNext + 1;
                return end;
            }
            else if (value[index] == 0x48) {
                index++;
                end = index;
                return parseTimeFn();
            }
            else if (value[index] == 0x4d) {
                index++;
                end = index;
                return parseTimeFn();
            }
        };
        var next = parseTimeFn();
        if (!next)
            return;
    }
    squote = Lexer.SQUOTE(value, end);
    if (!squote)
        return;
    end = squote;
    return Lexer.tokenize(value, start, end, 'Edm.Duration', Lexer.TokenType.Literal);
}
exports.durationValue = durationValue;
function binaryValue(value, index) {
    var start = index;
    if (!Utils.equals(value, index, 'binary'))
        return;
    index += 6;
    var squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    var valStart = index;
    while (index < value.length && !(squote = Lexer.SQUOTE(value, index))) {
        var end = Math.max(Lexer.base64b16(value, index), Lexer.base64b8(value, index));
        if (end > index)
            index = end;
        else if (Lexer.base64char(value[index]) &&
            Lexer.base64char(value[index + 1]) &&
            Lexer.base64char(value[index + 2]) &&
            Lexer.base64char(value[index + 3]))
            index += 4;
        else
            index++;
    }
    index = squote;
    return Lexer.tokenize(value, start, index, 'Edm.Binary' /*new Edm.Binary(stringify(value, valStart, index - 1))*/, Lexer.TokenType.Literal);
}
exports.binaryValue = binaryValue;
function dateValue(value, index) {
    var yearNext = Lexer.year(value, index);
    if (yearNext == index || value[yearNext] != 0x2d)
        return;
    var monthNext = Lexer.month(value, yearNext + 1);
    if ((monthNext == yearNext + 1) || value[monthNext] != 0x2d)
        return;
    var dayNext = Lexer.day(value, monthNext + 1);
    //TODO: join dateValue and dateTimeOffsetValue for optimalization
    if (dayNext == monthNext + 1 || value[dayNext] == 0x54)
        return;
    return Lexer.tokenize(value, index, dayNext, 'Edm.Date', Lexer.TokenType.Literal);
}
exports.dateValue = dateValue;
function dateTimeOffsetValue(value, index) {
    var yearNext = Lexer.year(value, index);
    if (yearNext == index || value[yearNext] != 0x2d)
        return;
    var monthNext = Lexer.month(value, yearNext + 1);
    if ((monthNext == yearNext + 1) || value[monthNext] != 0x2d)
        return;
    var dayNext = Lexer.day(value, monthNext + 1);
    if (dayNext == monthNext + 1 || value[dayNext] != 0x54)
        return;
    var hourNext = Lexer.hour(value, dayNext + 1);
    var colon = Lexer.COLON(value, hourNext);
    if (hourNext == colon || !colon)
        return;
    var minuteNext = Lexer.minute(value, hourNext + 1);
    if (minuteNext == hourNext + 1)
        return;
    var end = minuteNext;
    var colon = Lexer.COLON(value, minuteNext);
    if (colon) {
        var secondNext = Lexer.second(value, colon);
        if (secondNext == colon)
            return;
        if (value[secondNext] == 0x2e) {
            var fractionalSecondsNext = Lexer.fractionalSeconds(value, secondNext + 1);
            if (fractionalSecondsNext == secondNext + 1)
                return;
            end = fractionalSecondsNext;
        }
        else
            end = secondNext;
    }
    var sign = Lexer.SIGN(value, end);
    if (value[end] == 0x5a) {
        end++;
    }
    else if (sign) {
        var zHourNext = Lexer.hour(value, sign);
        var colon = Lexer.COLON(value, zHourNext);
        if (zHourNext == sign || !colon)
            return;
        var zMinuteNext = Lexer.minute(value, colon);
        if (zMinuteNext == colon)
            return;
        end = zMinuteNext;
    }
    else
        return;
    return Lexer.tokenize(value, index, end, 'Edm.DateTimeOffset', Lexer.TokenType.Literal);
}
exports.dateTimeOffsetValue = dateTimeOffsetValue;
function timeOfDayValue(value, index) {
    var hourNext = Lexer.hour(value, index);
    var colon = Lexer.COLON(value, hourNext);
    if (hourNext == index || !colon)
        return;
    var minuteNext = Lexer.minute(value, colon);
    if (minuteNext == colon)
        return;
    var end = minuteNext;
    colon = Lexer.COLON(value, minuteNext);
    if (colon) {
        var secondNext = Lexer.second(value, colon);
        if (secondNext == colon)
            return;
        if (value[secondNext] == 0x2e) {
            var fractionalSecondsNext = Lexer.fractionalSeconds(value, secondNext + 1);
            if (fractionalSecondsNext == secondNext + 1)
                return;
            end = fractionalSecondsNext;
        }
        else
            end = secondNext;
    }
    return Lexer.tokenize(value, index, end, 'Edm.TimeOfDay', Lexer.TokenType.Literal);
}
exports.timeOfDayValue = timeOfDayValue;
// geography and geometry literals
function positionLiteral(value, index) {
    var longitude = doubleValue(value, index);
    if (!longitude)
        return;
    if (!Lexer.SP(value[longitude.next]))
        return;
    var latitude = doubleValue(value, longitude.next + 1);
    if (!latitude)
        return;
    return Lexer.tokenize(value, index, latitude.next, { longitude: longitude, latitude: latitude }, Lexer.TokenType.Literal);
}
exports.positionLiteral = positionLiteral;
function pointData(value, index) {
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    var start = index;
    index = open;
    var position = positionLiteral(value, index);
    if (!position)
        return;
    index = position.next;
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, position, Lexer.TokenType.Literal);
}
exports.pointData = pointData;
function lineStringData(value, index) {
    return multiGeoLiteralFactory(value, index, '', positionLiteral);
}
exports.lineStringData = lineStringData;
function ringLiteral(value, index) {
    return multiGeoLiteralFactory(value, index, '', positionLiteral);
    // Within each ringLiteral, the first and last positionLiteral elements MUST be an exact syntactic match to each other.
    // Within the polygonData, the ringLiterals MUST specify their points in appropriate winding order.
    // In order of traversal, points to the left side of the ring are interpreted as being in the polygon.
}
exports.ringLiteral = ringLiteral;
function polygonData(value, index) {
    return multiGeoLiteralFactory(value, index, '', ringLiteral);
}
exports.polygonData = polygonData;
function sridLiteral(value, index) {
    if (!Utils.equals(value, index, 'SRID'))
        return;
    var start = index;
    index += 4;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index++;
    var digit = Utils.required(value, index, Lexer.DIGIT, 1, 5);
    if (!digit)
        return;
    index = digit;
    var semi = Lexer.SEMI(value, index);
    if (!semi)
        return;
    index = semi;
    return Lexer.tokenize(value, start, index, 'SRID', Lexer.TokenType.Literal);
}
exports.sridLiteral = sridLiteral;
function pointLiteral(value, index) {
    if (!Utils.equals(value, index, 'Point'))
        return;
    var start = index;
    index += 5;
    var data = pointData(value, index);
    if (!data)
        return;
    return Lexer.tokenize(value, start, data.next, data, Lexer.TokenType.Literal);
}
exports.pointLiteral = pointLiteral;
function polygonLiteral(value, index) {
    if (!Utils.equals(value, index, 'Polygon'))
        return;
    var start = index;
    index += 7;
    var data = polygonData(value, index);
    if (!data)
        return;
    return Lexer.tokenize(value, start, data.next, data, Lexer.TokenType.Literal);
}
exports.polygonLiteral = polygonLiteral;
function collectionLiteral(value, index) {
    return multiGeoLiteralFactory(value, index, 'Collection', geoLiteral);
}
exports.collectionLiteral = collectionLiteral;
function lineStringLiteral(value, index) {
    if (!Utils.equals(value, index, 'LineString'))
        return;
    var start = index;
    index += 10;
    var data = lineStringData(value, index);
    if (!data)
        return;
    index = data.next;
    return Lexer.tokenize(value, start, index, data, Lexer.TokenType.Literal);
}
exports.lineStringLiteral = lineStringLiteral;
function multiLineStringLiteral(value, index) {
    return multiGeoLiteralOptionalFactory(value, index, 'MultiLineString', lineStringData);
}
exports.multiLineStringLiteral = multiLineStringLiteral;
function multiPointLiteral(value, index) {
    return multiGeoLiteralOptionalFactory(value, index, 'MultiPoint', pointData);
}
exports.multiPointLiteral = multiPointLiteral;
function multiPolygonLiteral(value, index) {
    return multiGeoLiteralOptionalFactory(value, index, 'MultiPolygon', polygonData);
}
exports.multiPolygonLiteral = multiPolygonLiteral;
function multiGeoLiteralFactory(value, index, prefix, itemLiteral) {
    if (!Utils.equals(value, index, prefix + '('))
        return;
    var start = index;
    index += prefix.length + 1;
    var items = [];
    var geo = itemLiteral(value, index);
    if (!geo)
        return;
    index = geo.next;
    while (geo) {
        items.push(geo);
        var close = Lexer.CLOSE(value, index);
        if (close) {
            index = close;
            break;
        }
        var comma = Lexer.COMMA(value, index);
        if (!comma)
            return;
        index = comma;
        geo = itemLiteral(value, index);
        if (!geo)
            return;
        index = geo.next;
    }
    return Lexer.tokenize(value, start, index, { items: items }, Lexer.TokenType.Literal);
}
exports.multiGeoLiteralFactory = multiGeoLiteralFactory;
function multiGeoLiteralOptionalFactory(value, index, prefix, itemLiteral) {
    if (!Utils.equals(value, index, prefix + '('))
        return;
    var start = index;
    index += prefix.length + 1;
    var items = [];
    var close = Lexer.CLOSE(value, index);
    if (!close) {
        var geo = itemLiteral(value, index);
        if (!geo)
            return;
        index = geo.next;
        while (geo) {
            items.push(geo);
            close = Lexer.CLOSE(value, index);
            if (close) {
                index = close;
                break;
            }
            var comma = Lexer.COMMA(value, index);
            if (!comma)
                return;
            index = comma;
            geo = itemLiteral(value, index);
            if (!geo)
                return;
            index = geo.next;
        }
    }
    else
        index++;
    return Lexer.tokenize(value, start, index, { items: items }, Lexer.TokenType.Literal);
}
exports.multiGeoLiteralOptionalFactory = multiGeoLiteralOptionalFactory;
function geoLiteral(value, index) {
    return collectionLiteral(value, index) ||
        lineStringLiteral(value, index) ||
        multiPointLiteral(value, index) ||
        multiLineStringLiteral(value, index) ||
        multiPolygonLiteral(value, index) ||
        pointLiteral(value, index) ||
        polygonLiteral(value, index);
}
exports.geoLiteral = geoLiteral;
function fullPointLiteral(value, index) {
    return fullGeoLiteralFactory(value, index, pointLiteral);
}
exports.fullPointLiteral = fullPointLiteral;
function fullCollectionLiteral(value, index) {
    return fullGeoLiteralFactory(value, index, collectionLiteral);
}
exports.fullCollectionLiteral = fullCollectionLiteral;
function fullLineStringLiteral(value, index) {
    return fullGeoLiteralFactory(value, index, lineStringLiteral);
}
exports.fullLineStringLiteral = fullLineStringLiteral;
function fullMultiLineStringLiteral(value, index) {
    return fullGeoLiteralFactory(value, index, multiLineStringLiteral);
}
exports.fullMultiLineStringLiteral = fullMultiLineStringLiteral;
function fullMultiPointLiteral(value, index) {
    return fullGeoLiteralFactory(value, index, multiPointLiteral);
}
exports.fullMultiPointLiteral = fullMultiPointLiteral;
function fullMultiPolygonLiteral(value, index) {
    return fullGeoLiteralFactory(value, index, multiPolygonLiteral);
}
exports.fullMultiPolygonLiteral = fullMultiPolygonLiteral;
function fullPolygonLiteral(value, index) {
    return fullGeoLiteralFactory(value, index, polygonLiteral);
}
exports.fullPolygonLiteral = fullPolygonLiteral;
function fullGeoLiteralFactory(value, index, literal) {
    var srid = sridLiteral(value, index);
    if (!srid)
        return;
    var token = literal(value, srid.next);
    if (!token)
        return;
    return Lexer.tokenize(value, index, token.next, { srid: srid, value: token }, Lexer.TokenType.Literal);
}
exports.fullGeoLiteralFactory = fullGeoLiteralFactory;
function geographyCollection(value, index) {
    var prefix = Lexer.geographyPrefix(value, index);
    if (prefix == index)
        return;
    var start = index;
    index = prefix;
    var squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    var point = fullCollectionLiteral(value, index);
    if (!point)
        return;
    index = point.next;
    squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    return Lexer.tokenize(value, start, index, 'Edm.GeographyCollection', Lexer.TokenType.Literal);
}
exports.geographyCollection = geographyCollection;
function geographyLineString(value, index) {
    return geoLiteralFactory(value, index, 'Edm.GeographyLineString', Lexer.geographyPrefix, fullLineStringLiteral);
}
exports.geographyLineString = geographyLineString;
function geographyMultiLineString(value, index) {
    return geoLiteralFactory(value, index, 'Edm.GeographyMultiLineString', Lexer.geographyPrefix, fullMultiLineStringLiteral);
}
exports.geographyMultiLineString = geographyMultiLineString;
function geographyMultiPoint(value, index) {
    return geoLiteralFactory(value, index, 'Edm.GeographyMultiPoint', Lexer.geographyPrefix, fullMultiPointLiteral);
}
exports.geographyMultiPoint = geographyMultiPoint;
function geographyMultiPolygon(value, index) {
    return geoLiteralFactory(value, index, 'Edm.GeographyMultiPolygon', Lexer.geographyPrefix, fullMultiPolygonLiteral);
}
exports.geographyMultiPolygon = geographyMultiPolygon;
function geographyPoint(value, index) {
    return geoLiteralFactory(value, index, 'Edm.GeographyPoint', Lexer.geographyPrefix, fullPointLiteral);
}
exports.geographyPoint = geographyPoint;
function geographyPolygon(value, index) {
    return geoLiteralFactory(value, index, 'Edm.GeographyPolygon', Lexer.geographyPrefix, fullPolygonLiteral);
}
exports.geographyPolygon = geographyPolygon;
function geometryCollection(value, index) {
    return geoLiteralFactory(value, index, 'Edm.GeometryCollection', Lexer.geometryPrefix, fullCollectionLiteral);
}
exports.geometryCollection = geometryCollection;
function geometryLineString(value, index) {
    return geoLiteralFactory(value, index, 'Edm.GeometryLineString', Lexer.geometryPrefix, fullLineStringLiteral);
}
exports.geometryLineString = geometryLineString;
function geometryMultiLineString(value, index) {
    return geoLiteralFactory(value, index, 'Edm.GeometryMultiLineString', Lexer.geometryPrefix, fullMultiLineStringLiteral);
}
exports.geometryMultiLineString = geometryMultiLineString;
function geometryMultiPoint(value, index) {
    return geoLiteralFactory(value, index, 'Edm.GeometryMultiPoint', Lexer.geometryPrefix, fullMultiPointLiteral);
}
exports.geometryMultiPoint = geometryMultiPoint;
function geometryMultiPolygon(value, index) {
    return geoLiteralFactory(value, index, 'Edm.GeometryMultiPolygon', Lexer.geometryPrefix, fullMultiPolygonLiteral);
}
exports.geometryMultiPolygon = geometryMultiPolygon;
function geometryPoint(value, index) {
    return geoLiteralFactory(value, index, 'Edm.GeometryPoint', Lexer.geometryPrefix, fullPointLiteral);
}
exports.geometryPoint = geometryPoint;
function geometryPolygon(value, index) {
    return geoLiteralFactory(value, index, 'Edm.GeometryPolygon', Lexer.geometryPrefix, fullPolygonLiteral);
}
exports.geometryPolygon = geometryPolygon;
function geoLiteralFactory(value, index, type, prefix, literal) {
    var prefixNext = prefix(value, index);
    if (prefixNext == index)
        return;
    var start = index;
    index = prefixNext;
    var squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    var data = literal(value, index);
    if (!data)
        return;
    index = data.next;
    squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    return Lexer.tokenize(value, start, index, type, Lexer.TokenType.Literal);
}
exports.geoLiteralFactory = geoLiteralFactory;
function primitiveLiteral(value, index) {
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
exports.primitiveLiteral = primitiveLiteral;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUMxQyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ2pDLG1CQUFtQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDakMsd0JBQXdCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUN0QyxtQkFBbUIsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ2pDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDbkMsY0FBYyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDNUIsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUM5QixrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ2hDLGtCQUFrQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDaEMsdUJBQXVCLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUNyQyxrQkFBa0IsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ2hDLG9CQUFvQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDbEMsYUFBYSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDM0IsZUFBZSxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsQ0FBQztBQUNoQyxDQUFDO0FBakNlLHdCQUFnQixtQkFpQy9CLENBQUEiLCJmaWxlIjoicHJpbWl0aXZlTGl0ZXJhbC5qcyIsInNvdXJjZVJvb3QiOiIuLi9zcmMifQ==

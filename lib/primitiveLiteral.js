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
                    if (Lexer.pcharNoSQUOTE(value, index) > index && !close && !comma && Lexer.RWS(value, index) == index)
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByaW1pdGl2ZUxpdGVyYWwudHMiXSwibmFtZXMiOlsibnVsbFZhbHVlIiwiYm9vbGVhblZhbHVlIiwiZ3VpZFZhbHVlIiwic2J5dGVWYWx1ZSIsImJ5dGVWYWx1ZSIsImludDE2VmFsdWUiLCJpbnQzMlZhbHVlIiwiaW50NjRWYWx1ZSIsImRlY2ltYWxWYWx1ZSIsImRvdWJsZVZhbHVlIiwic2luZ2xlVmFsdWUiLCJzdHJpbmdWYWx1ZSIsImR1cmF0aW9uVmFsdWUiLCJiaW5hcnlWYWx1ZSIsImRhdGVWYWx1ZSIsImRhdGVUaW1lT2Zmc2V0VmFsdWUiLCJ0aW1lT2ZEYXlWYWx1ZSIsInBvc2l0aW9uTGl0ZXJhbCIsInBvaW50RGF0YSIsImxpbmVTdHJpbmdEYXRhIiwicmluZ0xpdGVyYWwiLCJwb2x5Z29uRGF0YSIsInNyaWRMaXRlcmFsIiwicG9pbnRMaXRlcmFsIiwicG9seWdvbkxpdGVyYWwiLCJjb2xsZWN0aW9uTGl0ZXJhbCIsImxpbmVTdHJpbmdMaXRlcmFsIiwibXVsdGlMaW5lU3RyaW5nTGl0ZXJhbCIsIm11bHRpUG9pbnRMaXRlcmFsIiwibXVsdGlQb2x5Z29uTGl0ZXJhbCIsIm11bHRpR2VvTGl0ZXJhbEZhY3RvcnkiLCJtdWx0aUdlb0xpdGVyYWxPcHRpb25hbEZhY3RvcnkiLCJnZW9MaXRlcmFsIiwiZnVsbFBvaW50TGl0ZXJhbCIsImZ1bGxDb2xsZWN0aW9uTGl0ZXJhbCIsImZ1bGxMaW5lU3RyaW5nTGl0ZXJhbCIsImZ1bGxNdWx0aUxpbmVTdHJpbmdMaXRlcmFsIiwiZnVsbE11bHRpUG9pbnRMaXRlcmFsIiwiZnVsbE11bHRpUG9seWdvbkxpdGVyYWwiLCJmdWxsUG9seWdvbkxpdGVyYWwiLCJmdWxsR2VvTGl0ZXJhbEZhY3RvcnkiLCJnZW9ncmFwaHlDb2xsZWN0aW9uIiwiZ2VvZ3JhcGh5TGluZVN0cmluZyIsImdlb2dyYXBoeU11bHRpTGluZVN0cmluZyIsImdlb2dyYXBoeU11bHRpUG9pbnQiLCJnZW9ncmFwaHlNdWx0aVBvbHlnb24iLCJnZW9ncmFwaHlQb2ludCIsImdlb2dyYXBoeVBvbHlnb24iLCJnZW9tZXRyeUNvbGxlY3Rpb24iLCJnZW9tZXRyeUxpbmVTdHJpbmciLCJnZW9tZXRyeU11bHRpTGluZVN0cmluZyIsImdlb21ldHJ5TXVsdGlQb2ludCIsImdlb21ldHJ5TXVsdGlQb2x5Z29uIiwiZ2VvbWV0cnlQb2ludCIsImdlb21ldHJ5UG9seWdvbiIsImdlb0xpdGVyYWxGYWN0b3J5IiwicHJpbWl0aXZlTGl0ZXJhbCJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBWSxLQUFLLFdBQU0sU0FBUyxDQUFDLENBQUE7QUFDakMsSUFBWSxLQUFLLFdBQU0sU0FBUyxDQUFDLENBQUE7QUFDakMsSUFBWSxnQkFBZ0IsV0FBTSxvQkFBb0IsQ0FBQyxDQUFBO0FBRXZELG1CQUEwQixLQUEyQixFQUFFLEtBQVk7SUFDbEVBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLE1BQU1BLENBQUNBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLEdBQUdBLENBQUNBLEVBQUVBLE1BQU1BLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO0FBQ3pIQSxDQUFDQTtBQUZlLGlCQUFTLFlBRXhCLENBQUE7QUFDRCxzQkFBNkIsS0FBMkIsRUFBRSxLQUFZO0lBQ3JFQyxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxHQUFHQSxDQUFDQSxFQUFFQSxhQUFhQSxFQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUMvSEEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsR0FBR0EsQ0FBQ0EsRUFBRUEsYUFBYUEsRUFBRUEsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7QUFDaklBLENBQUNBO0FBSGUsb0JBQVksZUFHM0IsQ0FBQTtBQUNELG1CQUEwQixLQUFLLEVBQUUsS0FBSztJQUNyQ0MsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDbkRBLEtBQUtBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLElBQUlBO1FBQ3hCQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxHQUFHQSxDQUFDQSxFQUFFQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUNwREEsS0FBS0EsQ0FBQ0EsS0FBS0EsR0FBR0EsRUFBRUEsQ0FBQ0EsSUFBSUEsSUFBSUE7UUFDekJBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEdBQUdBLEVBQUVBLEVBQUVBLEtBQUtBLENBQUNBLE1BQU1BLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO1FBQ3JEQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxFQUFFQSxDQUFDQSxJQUFJQSxJQUFJQTtRQUN6QkEsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsR0FBR0EsRUFBRUEsRUFBRUEsS0FBS0EsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDckRBLEtBQUtBLENBQUNBLEtBQUtBLEdBQUdBLEVBQUVBLENBQUNBLElBQUlBLElBQUlBO1FBQ3pCQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxHQUFHQSxFQUFFQSxFQUFFQSxLQUFLQSxDQUFDQSxNQUFNQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxHQUFHQSxFQUFFQSxFQUFFQSxVQUFVQSxFQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtBQUM1SUEsQ0FBQ0E7QUFWZSxpQkFBUyxZQVV4QixDQUFBO0FBQ0Qsb0JBQTJCLEtBQTJCLEVBQUUsS0FBWTtJQUNuRUMsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDbEJBLElBQUlBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3BDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUV2QkEsSUFBSUEsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDM0RBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ1ZBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBO1FBQ3JDQSxJQUFJQSxHQUFHQSxHQUFHQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsR0FBR0EsSUFBSUEsR0FBR0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsRUFBRUEsV0FBV0EsRUFBRUEsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7SUFDaEhBLENBQUNBO0FBQ0ZBLENBQUNBO0FBWGUsa0JBQVUsYUFXekIsQ0FBQTtBQUNELG1CQUEwQixLQUEyQixFQUFFLEtBQVk7SUFDbEVDLElBQUlBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0lBQzNEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNWQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQTtRQUNyQ0EsSUFBSUEsR0FBR0EsR0FBR0EsUUFBUUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7UUFDNURBLEVBQUVBLENBQUNBLENBQUNBLEdBQUdBLElBQUlBLENBQUNBLElBQUlBLEdBQUdBLElBQUlBLEdBQUdBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLEVBQUVBLFVBQVVBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO0lBQzVHQSxDQUFDQTtBQUNGQSxDQUFDQTtBQVBlLGlCQUFTLFlBT3hCLENBQUE7QUFDRCxvQkFBMkIsS0FBMkIsRUFBRSxLQUFZO0lBQ25FQyxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtJQUNsQkEsSUFBSUEsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDcENBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBO1FBQUNBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBO0lBRXZCQSxJQUFJQSxJQUFJQSxHQUFHQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxLQUFLQSxFQUFFQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUMzREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDVkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0E7UUFDckNBLElBQUlBLEdBQUdBLEdBQUdBLFFBQVFBLENBQUNBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLElBQUlBLENBQUNBLEVBQUVBLEVBQUVBLENBQUNBLENBQUNBO1FBQzVEQSxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxLQUFLQSxJQUFJQSxHQUFHQSxJQUFJQSxLQUFLQSxDQUFDQTtZQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxFQUFFQSxXQUFXQSxFQUFFQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxPQUFPQSxDQUFDQSxDQUFDQTtJQUNwSEEsQ0FBQ0E7QUFDRkEsQ0FBQ0E7QUFYZSxrQkFBVSxhQVd6QixDQUFBO0FBQ0Qsb0JBQTJCLEtBQTJCLEVBQUUsS0FBWTtJQUNuRUMsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0E7SUFDbEJBLElBQUlBLElBQUlBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3BDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQTtRQUFDQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQTtJQUV2QkEsSUFBSUEsSUFBSUEsR0FBR0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsQ0FBQ0EsRUFBRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0E7SUFDNURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1FBQ1ZBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQUNBLE1BQU1BLENBQUNBO1FBQ3JDQSxJQUFJQSxHQUFHQSxHQUFHQSxRQUFRQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxJQUFJQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQSxDQUFDQTtRQUM1REEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsSUFBSUEsQ0FBQ0EsVUFBVUEsSUFBSUEsR0FBR0EsSUFBSUEsVUFBVUEsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsRUFBRUEsSUFBSUEsRUFBRUEsV0FBV0EsRUFBRUEsS0FBS0EsQ0FBQ0EsU0FBU0EsQ0FBQ0Es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RUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ2JBLElBQUlBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO29CQUN2QkEsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3JEQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxHQUFHQSxLQUFLQSxJQUFJQSxDQUFDQSxLQUFLQSxJQUFJQSxDQUFDQSxLQUFLQSxJQUFJQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxJQUFJQSxLQUFLQSxDQUFDQTt3QkFBQ0EsTUFBTUEsQ0FBQ0E7b0JBQzlHQSxLQUFLQSxDQUFDQTtnQkFDUEEsQ0FBQ0E7Z0JBQUNBLElBQUlBLENBQUNBLENBQUNBO29CQUNQQSxLQUFLQSxHQUFHQSxNQUFNQSxDQUFDQTtnQkFDaEJBLENBQUNBO1lBQ0ZBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNQQSxJQUFJQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxFQUFFQSxLQUFLQSxDQUFDQSxhQUFhQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDckZBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLElBQUlBLEtBQUtBLENBQUNBO29CQUFDQSxNQUFNQSxDQUFDQTtnQkFDL0JBLEtBQUtBLEdBQUdBLFNBQVNBLENBQUNBO1lBQ25CQSxDQUFDQTtRQUNGQSxDQUFDQTtRQUVEQSxNQUFNQSxHQUFHQSxLQUFLQSxDQUFDQSxNQUFNQSxDQUFDQSxLQUFLQSxFQUFF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LENBQUNBLENBQUNBLE1BQU1BLEdBQUdBLEtBQUtBLENBQUNBLE1BQU1BLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBO1FBQ3ZFQSxJQUFJQSxHQUFHQSxHQUFHQSxJQUFJQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxFQUFFQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNoRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsR0FBR0EsS0FBS0EsQ0FBQ0E7WUFBQ0EsS0FBS0EsR0FBR0EsR0FBR0EsQ0FBQ0E7UUFDN0JBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQ3RDQSxLQUFLQSxDQUFDQSxVQUFVQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNsQ0EsS0FBS0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbENBLEtBQUtBLENBQUNBLFVBQVVBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQUNBLEtBQUtBLElBQUlBLENBQUNBLENBQUNBO1FBQ2hEQSxJQUFJQTtZQUFDQSxLQUFLQSxFQUFFQSxDQUFDQTtJQUNkQSxDQUFDQTtJQUNEQSxLQUFLQSxHQUFHQSxNQUFNQSxDQUFDQTtJQUVmQSxNQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxLQUFLQSxFQUFFQSxZQUFZQSxDQUFDQSx5REFBeURBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO0FBQzdJQSxDQUFDQTtBQXRCZSxtQkFBVyxjQXNCMUIsQ0FBQTtBQUNELG1CQUEwQixLQUEyQixFQUFFLEtBQVk7SUFDbEVDLElBQUlBLFFBQVFBLEdBQUdBLEtBQUtBLENBQUNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0lBQ3hDQSxFQUFFQSxDQUFDQSxDQUFDQSxRQUFRQSxJQUFJQSxLQUFLQSxJQUFJQSxLQUFLQSxDQUFDQSxRQUFRQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUN6REEsSUFBSUEsU0FBU0EsR0FBR0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsUUFBUUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDakRBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLElBQUlBLFFBQVFBLEdBQUdBLENBQUNBLENBQUNBLElBQUlBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLElBQUlBLElBQUlBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ3BFQSxJQUFJQSxPQUFPQSxHQUFHQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxLQUFLQSxFQUFFQSxTQUFTQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUM5Q0EsaUVBQWlFQTtJQUNqRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsT0FBT0EsSUFBSUEsU0FBU0EsR0FBR0EsQ0FBQ0EsSUFBSUEsS0FBS0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDL0RBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLEVBQUVBLE9BQU9BLEVBQUVBLFVBQVVBLEVBQUVBLEtBQUtBLENBQUNBLFNBQVNBLENBQUNBLE9BQU9BLENBQUNBLENBQUNBO0FBQ25GQSxDQUFDQTtBQVRlLGlCQUFTLFlBU3hCLENBQUE7QUFDRCw2QkFBb0MsS0FBMkIsRUFBRSxLQUFZO0lBQzVFQyxJQUFJQSxRQUFRQSxHQUFHQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtJQUN4Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsSUFBSUEsS0FBS0EsSUFBSUEsS0FBS0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsSUFBSUEsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDekRBLElBQUlBLFNBQVNBLEdBQUdBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEVBQUVBLFFBQVFBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO0lBQ2pEQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxJQUFJQSxRQUFRQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxLQUFLQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQTtRQUFDQSxNQUFNQSxDQUFDQTtJQUNwRUEsSUFBSUEsT0FBT0EsR0FBR0EsS0FBS0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsS0FBS0EsRUFBRUEsU0FBU0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDOUNBLEVBQUVBLENBQUNBLENBQUNBLE9BQU9BLElBQUlBLFNBQVNBLEdBQUdBLENBQUNBLElBQUlBLEtBQUtBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLElBQUlBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQy9EQSxJQUFJQSxRQUFRQSxHQUFHQSxLQUFLQSxDQUFDQSxJQUFJQSxDQUFDQSxLQUFLQSxFQUFFQSxPQUFPQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUU5Q0EsSUFBSUEsS0FBS0EsR0FBR0EsS0FBS0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsS0FBS0EsRUFBRUEsUUFBUUEsQ0FBQ0EsQ0FBQ0E7SUFDekNBLEVBQUVBLENBQUNBLENBQUNBLFFBQVFBLElBQUlBLEtBQUtBLElBQUlBLENBQUNBLEtBQUtBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ3hDQSxJQUFJQSxVQUFV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RUEsS0FBS0EsRUFBRUEsTUFBTUEsR0FBR0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFBQ0EsTUFBTUEsQ0FBQ0E7SUFDdERBLElBQUlBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO0lBQ2xCQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQTtJQUUzQkEsSUFBSUEsS0FBS0EsR0FBR0EsRUFBRUEsQ0FBQ0E7SUFDZkEsSUFBSUEsR0FBR0EsR0FBR0EsV0FBV0EsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0E7SUFDcENBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLEdBQUdBLENBQUNBO1FBQUNBLE1BQU1BLENBQUNBO0lBQ2pCQSxLQUFLQSxHQUFHQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQTtJQUVqQkEsT0FBT0EsR0FBR0EsRUFBQ0EsQ0FBQ0E7UUFDWEEsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFFaEJBLElBQUlBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBLEtBQUtBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQ3RDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFBQSxDQUFDQTtZQUNWQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQTtZQUNkQSxLQUFLQSxDQUFDQTtRQUNQQSxDQUFDQTtRQUVEQSxJQUFJQSxLQUFLQSxHQUFHQSxLQUFLQSxDQUFDQSxLQUFLQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQTtRQUN0Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsS0FBS0EsQ0FBQ0E7WUFBQ0EsTUFBTUEsQ0FBQ0E7UUFDbkJBLEtBQUtBLEdBQUdBLEtBQUtBLENBQUNBO1FBRWRBLEdBQUdBLEdBQUdBLFdBQVdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO1FBQ2hDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFD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QSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUM1QkEsWUFBWUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0E7UUFDMUJBLFdBQVdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBO1FBQ3pCQSxXQUFXQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUN6QkEsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0E7UUFDeEJBLFNBQVNBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBO1FBQ3ZCQSxVQUFVQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUN4QkEsVUFBVUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0E7UUFDeEJBLFVBQVVBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBO1FBQ3hCQSxXQUFXQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUN6QkEsYUFBYUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0E7UUFDM0JBLFdBQVdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBO1FBQ3pCQSxnQkFBZ0JBLENBQUNBLFdBQVdBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBO1FBQzFDQSxtQkFBbUJBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBO1FBQ2pDQSxtQkFBbUJBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBO1FBQ2pDQSx3QkFBd0JBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBO1FBQ3RDQSxtQkFBbUJBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBO1FBQ2pDQSxxQkFBcUJBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBO1FBQ25DQSxjQUFjQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUM1QkEsZ0JBQWdCQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUM5QkEsa0JBQWtCQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUNoQ0Esa0JBQWtCQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUNoQ0EsdUJBQXVCQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUNyQ0Esa0JBQWtCQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUNoQ0Esb0JBQW9CQSxDQUFDQSxLQUFLQSxFQUFFQSxLQUFLQSxDQUFDQTtRQUNsQ0EsYUFBYUEsQ0FBQ0EsS0FBS0EsRUFBRUEsS0FBS0EsQ0FBQ0E7UUFDM0JBLGVBQWVBLENBQUNBLEtBQUtBLEVBQUVBLEtBQUtBLENBQUNBLENBQUNBO0FBQ2hDQSxDQUFDQTtBQWpDZSx3QkFBZ0IsbUJBaUMvQixDQUFBIiwiZmlsZSI6InByaW1pdGl2ZUxpdGVyYWwuanMiLCJzb3VyY2VSb290IjoiLi4vc3JjIn0=

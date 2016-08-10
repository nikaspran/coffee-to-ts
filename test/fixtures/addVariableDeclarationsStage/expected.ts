module = require('refactor/module')

module.filter('wmToStripeDimensionsString', ->
return (value) ->
if _.isPlainObject(value) && !_.isEmpty(value)
	return "#{value.width} in x #{value.height} in x #{value.length} in, #{value.weight} oz"
)

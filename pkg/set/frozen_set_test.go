package set

import (
	"sort"
	"testing"

	"github.com/stackrox/rox/pkg/sliceutils"
	"github.com/stretchr/testify/assert"
)

func assertFrozenSetContainsExactly(t *testing.T, fs FrozenStringSet, elements ...string) {
	a := assert.New(t)
	for _, elem := range elements {
		a.True(fs.Contains(elem))
	}

	falseCases := []string{"BLAH", "blah", "BLACK", "SheeP"}
	for _, elem := range falseCases {
		if sliceutils.StringFind(falseCases, elem) == -1 {
			a.False(fs.Contains(elem))
		}
	}
	a.ElementsMatch(fs.AsSlice(), elements)

	sort.Strings(elements)
	a.Equal(elements, fs.AsSortedSlice(func(i, j string) bool {
		return i < j
	}))

	sort.Slice(elements, func(i, j int) bool {
		return elements[i] > elements[j]
	})
	a.Equal(elements, fs.AsSortedSlice(func(i, j string) bool {
		return i > j
	}))

}

func TestFrozenStringSet(t *testing.T) {
	elements := []string{"a", "bcd"}
	fs := NewFrozenStringSet(elements...)
	assertFrozenSetContainsExactly(t, fs, elements...)

	emptyFS := NewFrozenStringSet()
	assertFrozenSetContainsExactly(t, emptyFS)
}

func TestFrozenStringSetAfterFreeze(t *testing.T) {
	set := NewStringSet()
	set.Add("a")
	set.Add("apple")
	fs := set.Freeze()

	assertFrozenSetContainsExactly(t, fs, "a", "apple")

	emptySet := NewStringSet()
	emptyFS := emptySet.Freeze()
	assertFrozenSetContainsExactly(t, emptyFS)
}

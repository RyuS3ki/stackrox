// Code generated by genny. DO NOT EDIT.
// This file was automatically generated by genny.
// Any changes will be lost if this file is regenerated.
// see https://github.com/mauricelam/genny

package permissions

import (
	"sort"

	mapset "github.com/deckarep/golang-set"
)

// If you want to add a set for your custom type, simply add another go generate line along with the
// existing ones. If you're creating a set for a primitive type, you can follow the example of "string"
// and create the generated file in this package.
// Sometimes, you might need to create it in the same package where it is defined to avoid import cycles.
// The permission set is an example of how to do that.
// You can also specify the -imp command to specify additional imports in your generated file, if required.

// Resource represents a generic type that we want to have a set of.

// ResourceSet will get translated to generic sets.
// It uses mapset.Set as the underlying implementation, so it comes with a bunch
// of utility methods, and is thread-safe.
type ResourceSet struct {
	underlying mapset.Set
}

// Add adds an element of type Resource.
func (k ResourceSet) Add(i Resource) bool {
	if k.underlying == nil {
		k.underlying = mapset.NewSet()
	}

	return k.underlying.Add(i)
}

// Remove removes an element of type Resource.
func (k ResourceSet) Remove(i Resource) {
	if k.underlying != nil {
		k.underlying.Remove(i)
	}
}

// Contains returns whether the set contains an element of type Resource.
func (k ResourceSet) Contains(i Resource) bool {
	if k.underlying != nil {
		return k.underlying.Contains(i)
	}
	return false
}

// Cardinality returns the number of elements in the set.
func (k ResourceSet) Cardinality() int {
	if k.underlying != nil {
		return k.underlying.Cardinality()
	}
	return 0
}

// Difference returns a new set with all elements of k not in other.
func (k ResourceSet) Difference(other ResourceSet) ResourceSet {
	if k.underlying == nil {
		return ResourceSet{underlying: other.underlying}
	} else if other.underlying == nil {
		return ResourceSet{underlying: k.underlying}
	}

	return ResourceSet{underlying: k.underlying.Difference(other.underlying)}
}

// Intersect returns a new set with the intersection of the members of both sets.
func (k ResourceSet) Intersect(other ResourceSet) ResourceSet {
	if k.underlying != nil && other.underlying != nil {
		return ResourceSet{underlying: k.underlying.Intersect(other.underlying)}
	}
	return ResourceSet{}
}

// Union returns a new set with the union of the members of both sets.
func (k ResourceSet) Union(other ResourceSet) ResourceSet {
	if k.underlying == nil {
		return ResourceSet{underlying: other.underlying}
	} else if other.underlying == nil {
		return ResourceSet{underlying: k.underlying}
	}

	return ResourceSet{underlying: k.underlying.Union(other.underlying)}
}

// Equal returns a bool if the sets are equal
func (k ResourceSet) Equal(other ResourceSet) bool {
	if k.underlying == nil && other.underlying == nil {
		return true
	}
	if k.underlying == nil || other.underlying == nil {
		return false
	}
	return k.underlying.Equal(other.underlying)
}

// AsSlice returns a slice of the elements in the set. The order is unspecified.
func (k ResourceSet) AsSlice() []Resource {
	if k.underlying == nil {
		return nil
	}
	elems := make([]Resource, 0, k.Cardinality())
	for elem := range k.underlying.Iter() {
		elems = append(elems, elem.(Resource))
	}
	return elems
}

// AsSortedSlice returns a slice of the elements in the set, sorted using the passed less function.
func (k ResourceSet) AsSortedSlice(less func(i, j Resource) bool) []Resource {
	slice := k.AsSlice()
	if len(slice) < 2 {
		return slice
	}
	// Since we're generating the code, we might as well use sort.Sort
	// and avoid paying the reflection penalty of sort.Slice.
	sortable := &sortableresourceSlice{slice: slice, less: less}
	sort.Sort(sortable)
	return sortable.slice
}

// IsInitialized returns whether the set has been initialized
func (k ResourceSet) IsInitialized() bool {
	return k.underlying != nil
}

// Iter returns a range of elements you can iterate over.
// Note that in most cases, this is actually slower than pulling out a slice
// and ranging over that.
// NOTE THAT YOU MUST DRAIN THE RETURNED CHANNEL, OR THE SET WILL BE DEADLOCKED FOREVER.
func (k ResourceSet) Iter() <-chan Resource {
	ch := make(chan Resource)
	if k.underlying != nil {
		go func() {
			for elem := range k.underlying.Iter() {
				ch <- elem.(Resource)
			}
			close(ch)
		}()
	} else {
		close(ch)
	}
	return ch
}

// Freeze returns a new, frozen version of the set.
func (k ResourceSet) Freeze() FrozenResourceSet {
	return NewFrozenResourceSet(k.AsSlice()...)
}

// NewResourceSet returns a new set with the given key type.
func NewResourceSet(initial ...Resource) ResourceSet {
	k := ResourceSet{underlying: mapset.NewSet()}
	for _, elem := range initial {
		k.Add(elem)
	}
	return k
}

type sortableresourceSlice struct {
	slice []Resource
	less  func(i, j Resource) bool
}

func (s *sortableresourceSlice) Len() int {
	return len(s.slice)
}

func (s *sortableresourceSlice) Less(i, j int) bool {
	return s.less(s.slice[i], s.slice[j])
}

func (s *sortableresourceSlice) Swap(i, j int) {
	s.slice[j], s.slice[i] = s.slice[i], s.slice[j]
}

// A FrozenResourceSet is a frozen set of Resource elements, which
// cannot be modified after creation. This allows users to use it as if it were
// a "const" data structure, and also makes it slightly more optimal since
// we don't have to lock accesses to it.
type FrozenResourceSet struct {
	underlying map[Resource]struct{}
}

// NewFrozenResourceSetFromChan returns a new frozen set from the provided channel.
// It drains the channel.
// This can be useful to avoid unnecessary slice allocations.
func NewFrozenResourceSetFromChan(elementC <-chan Resource) FrozenResourceSet {
	underlying := make(map[Resource]struct{})
	for elem := range elementC {
		underlying[elem] = struct{}{}
	}
	return FrozenResourceSet{
		underlying: underlying,
	}
}

// NewFrozenResourceSet returns a new frozen set with the provided elements.
func NewFrozenResourceSet(elements ...Resource) FrozenResourceSet {
	underlying := make(map[Resource]struct{}, len(elements))
	for _, elem := range elements {
		underlying[elem] = struct{}{}
	}
	return FrozenResourceSet{
		underlying: underlying,
	}
}

// Contains returns whether the set contains the element.
func (k FrozenResourceSet) Contains(elem Resource) bool {
	_, ok := k.underlying[elem]
	return ok
}

// Cardinality returns the cardinality of the set.
func (k FrozenResourceSet) Cardinality() int {
	return len(k.underlying)
}

// AsSlice returns the elements of the set. The order is unspecified.
func (k FrozenResourceSet) AsSlice() []Resource {
	if len(k.underlying) == 0 {
		return nil
	}
	slice := make([]Resource, 0, len(k.underlying))
	for elem := range k.underlying {
		slice = append(slice, elem)
	}
	return slice
}

// AsSortedSlice returns the elements of the set as a sorted slice.
func (k FrozenResourceSet) AsSortedSlice(less func(i, j Resource) bool) []Resource {
	slice := k.AsSlice()
	if len(slice) < 2 {
		return slice
	}
	// Since we're generating the code, we might as well use sort.Sort
	// and avoid paying the reflection penalty of sort.Slice.
	sortable := &sortableresourceSlice{slice: slice, less: less}
	sort.Sort(sortable)
	return sortable.slice
}

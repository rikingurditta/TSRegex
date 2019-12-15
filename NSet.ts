// extending the functionality of the builtin Set
export default class NSet<T> extends Set<T> {
	// check if two sets are equal, i.e. they have the same elements
	equals(set2: Set<T>) {
		if (this.size != set2.size) {
			return false;
		}
		for (let item of this) {
			if (!set2.has(item)) {
				return false;
			}
		};
		let set1 = this;
		for (let item of set2) {
			if (!this.has(item)) {
				return false;
			}
		}
		return true;
	}


	// return a new set with all the elements from both sets
	union(set2: Set<T>) {
		return new NSet<T>([...this, ...set2]);
	}


	// mutate this set to add all elements of set2
	addAll(set2: Set<T>) {
		let set1 = this;
		set2.forEach((item) => this.add(item));
	}
}
/**
 * Author(s): Alex O, Kyle S
 */

//-------- CONSTANTS --------//

const VERSION_START = 1; //to start counting memento versions

//-------- CLASS --------//

export class CareTaker {
  //-------- FIELDS --------//

  versions = [];

  //-------- METHODS --------//

  placeVersion(memento) {
    this.versions.push(memento);
  }

  getVersion(version) {
    return this.versions[version];
  }

  getLowestWeightVersion() {
    let weights = [];
    let versions = [];

    for (let i = VERSION_START; i < this.versions.length; i++) {
      versions.push(JSON.parse(this.versions[i]));
      weights.push(versions[i - 1].weight);
    }

    const minWeight = Math.min(...weights);

    const num = versions.findIndex((version) => version.weight === minWeight);
    let test = this.versions[num];
    return this.versions[num + 1];
  }

  getVersions() {
    return this.versions;
  }

  equals(otherCareTaker) {
    if (!otherCareTaker) return false;
    if (!otherCareTaker.getVersions) return false;
    if (this === otherCareTaker) return true;

    const otherVersions = otherCareTaker.getVersions();
    if (this.versions === otherVersions) return true;

    if (this.versions.length !== otherVersions.length) return false;

    return otherCareTaker && this.versions;
  }

  copy() {
    const ct = new CareTaker();
    ct.versions = [...this.versions];
    return ct;
  }

  clear() {
    this.versions = [];
  }
} //end cass CareTaker

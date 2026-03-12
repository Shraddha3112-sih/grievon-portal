import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Nat32 "mo:core/Nat32";
import Int "mo:core/Int";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Grievance System
  module Grievance {
    public type Category = {
      #roads_infrastructure;
      #water_supply;
      #electricity;
      #sanitation;
      #public_safety;
      #healthcare;
      #education;
      #other;
    };

    public type Severity = {
      #low;
      #medium;
      #high;
    };

    public type Status = {
      #submitted;
      #under_review;
      #in_progress;
      #resolved;
    };

    public type T = {
      id : Text;
      citizenName : Text;
      contactInfo : Text;
      description : Text;
      category : Category;
      department : Text;
      location : Text;
      severity : Severity;
      duration : Text;
      status : Status;
      createdTimestamp : Int;
      updatedTimestamp : Int;
      adminRemark : ?Text;
      submittedBy : Principal;
    };

    public func compareByCreatedTimestamp(g1 : T, g2 : T) : Order.Order {
      Int.compare(g1.createdTimestamp, g2.createdTimestamp);
    };
  };

  public type GrievanceInput = {
    citizenName : Text;
    contactInfo : Text;
    description : Text;
    category : Grievance.Category;
    location : Text;
    severity : Grievance.Severity;
    duration : Text;
  };

  public type GrievanceStats = {
    totalGrievances : Nat;
    submittedCount : Nat;
    underReviewCount : Nat;
    inProgressCount : Nat;
    resolvedCount : Nat;
    categoryCounts : [(Grievance.Category, Nat)];
  };

  func mapCategoryToDepartment(category : Grievance.Category) : Text {
    switch (category) {
      case (#roads_infrastructure) { "Public Works Department" };
      case (#water_supply) { "Water Supply & Sewerage Board" };
      case (#electricity) { "Power Distribution Company" };
      case (#sanitation) { "Municipal Sanitation Department" };
      case (#public_safety) { "Police & Safety Department" };
      case (#healthcare) { "Health Department" };
      case (#education) { "Education Department" };
      case (#other) { "General Administration" };
    };
  };

  let grievances = Map.empty<Text, Grievance.T>();
  var grievanceIdCounter = 0;

  func generateGrievanceId() : Text {
    let timestamp = Time.now();
    grievanceIdCounter += 1;
    let dateStr = "2024-06-10"; // Simplified for example, should convert timestamp to date
    "GRV-" # dateStr # "-" # grievanceIdCounter.toText();
  };

  public shared ({ caller }) func submitGrievance(input : GrievanceInput) : async (Text, Grievance.T) {
    if (input.citizenName.isEmpty() or input.description.isEmpty()) {
      Runtime.trap("Citizen name and description are required.");
    };

    let id = generateGrievanceId();
    let timestamp = Time.now();

    let grievance : Grievance.T = {
      id;
      citizenName = input.citizenName;
      contactInfo = input.contactInfo;
      description = input.description;
      category = input.category;
      department = mapCategoryToDepartment(input.category);
      location = input.location;
      severity = input.severity;
      duration = input.duration;
      status = #submitted;
      createdTimestamp = timestamp;
      updatedTimestamp = timestamp;
      adminRemark = null;
      submittedBy = caller;
    };

    grievances.add(id, grievance);
    (id, grievance);
  };

  public query ({ caller }) func getGrievanceById(id : Text) : async Grievance.T {
    switch (grievances.get(id)) {
      case (null) { Runtime.trap("Grievance not found") };
      case (?grievance) { grievance };
    };
  };

  public query ({ caller }) func getMyGrievances() : async [Grievance.T] {
    grievances.values().filter(func(g) { g.submittedBy == caller }).toArray();
  };

  public query ({ caller }) func getAllGrievances() : async [Grievance.T] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all grievances");
    };
    grievances.values().toArray();
  };

  public shared ({ caller }) func updateGrievanceStatus(id : Text, newStatus : Grievance.Status, remark : ?Text) : async Grievance.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update grievance status");
    };

    switch (grievances.get(id)) {
      case (null) { Runtime.trap("Grievance not found") };
      case (?grievance) {
        let updatedGrievance : Grievance.T = {
          id = grievance.id;
          citizenName = grievance.citizenName;
          contactInfo = grievance.contactInfo;
          description = grievance.description;
          category = grievance.category;
          department = grievance.department;
          location = grievance.location;
          severity = grievance.severity;
          duration = grievance.duration;
          status = newStatus;
          createdTimestamp = grievance.createdTimestamp;
          updatedTimestamp = Time.now();
          adminRemark = remark;
          submittedBy = grievance.submittedBy;
        };
        grievances.add(id, updatedGrievance);
        updatedGrievance;
      };
    };
  };

  public shared ({ caller }) func addRemark(id : Text, remark : Text) : async Grievance.T {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add remarks");
    };

    switch (grievances.get(id)) {
      case (null) { Runtime.trap("Grievance not found") };
      case (?grievance) {
        let updatedGrievance : Grievance.T = {
          id = grievance.id;
          citizenName = grievance.citizenName;
          contactInfo = grievance.contactInfo;
          description = grievance.description;
          category = grievance.category;
          department = grievance.department;
          location = grievance.location;
          severity = grievance.severity;
          duration = grievance.duration;
          status = grievance.status;
          createdTimestamp = grievance.createdTimestamp;
          updatedTimestamp = Time.now();
          adminRemark = ?remark;
          submittedBy = grievance.submittedBy;
        };
        grievances.add(id, updatedGrievance);
        updatedGrievance;
      };
    };
  };

  public query ({ caller }) func getStats() : async GrievanceStats {
    var submittedCount = 0;
    var underReviewCount = 0;
    var inProgressCount = 0;
    var resolvedCount = 0;
    var categoryCounts : [(Grievance.Category, Nat)] = [];

    func updateCategoryCount(category : Grievance.Category) {
      switch (categoryCounts.find(func((cat, _)) { cat == category })) {
        case (null) {
          categoryCounts := categoryCounts.concat([(category, 1)]);
        };
        case (?(cat, count)) {
          categoryCounts := categoryCounts.filter(func((c, _)) { c != category }).concat([(category, count + 1)]);
        };
      };
    };

    grievances.values().forEach(
      func(g) {
        switch (g.status) {
          case (#submitted) { submittedCount += 1 };
          case (#under_review) { underReviewCount += 1 };
          case (#in_progress) { inProgressCount += 1 };
          case (#resolved) { resolvedCount += 1 };
        };
        updateCategoryCount(g.category);
      }
    );

    {
      totalGrievances = grievances.size();
      submittedCount;
      underReviewCount;
      inProgressCount;
      resolvedCount;
      categoryCounts;
    };
  };

  let initialGrievances : [Grievance.T] = [
    {
      id = "GRV-20240610-1";
      citizenName = "Rajesh Kumar";
      contactInfo = "9876543210";
      description = "Multiple potholes on the main road causing traffic jams and vehicle damage.";
      category = #roads_infrastructure;
      department = "Public Works Department";
      location = "Main Road, Sector 5";
      severity = #high;
      duration = "3 months";
      status = #submitted;
      createdTimestamp = 1718006400000000000;
      updatedTimestamp = 1718006400000000000;
      adminRemark = null;
      submittedBy = Principal.fromText("2vxsx-fae");
    },
    {
      id = "GRV-20240610-2";
      citizenName = "Priya Singh";
      contactInfo = "9123456780";
      description = "Frequent water supply disruptions in our area, especially during mornings.";
      category = #water_supply;
      department = "Water Supply & Sewerage Board";
      location = "Sector 12, Block C";
      severity = #medium;
      duration = "2 weeks";
      status = #under_review;
      createdTimestamp = 1718092800000000000;
      updatedTimestamp = 1718092800000000000;
      adminRemark = ? "Issue being investigated by the department.";
      submittedBy = Principal.fromText("2vxsx-fae");
    },
    {
      id = "GRV-20240610-3";
      citizenName = "Amit Patel";
      contactInfo = "9001234567";
      description = "Frequent power outages in the evening hours affecting daily activities.";
      category = #electricity;
      department = "Power Distribution Company";
      location = "Green Park";
      severity = #high;
      duration = "1 month";
      status = #in_progress;
      createdTimestamp = 1718179200000000000;
      updatedTimestamp = 1718179200000000000;
      adminRemark = ? "Maintenance work has started.";
      submittedBy = Principal.fromText("2vxsx-fae");
    },
    {
      id = "GRV-20240610-4";
      citizenName = "Sunita Verma";
      contactInfo = "8899775544";
      description = "Overflowing garbage bins and lack of regular cleaning in the area.";
      category = #sanitation;
      department = "Municipal Sanitation Department";
      location = "Market Area, Sector 9";
      severity = #medium;
      duration = "1 week";
      status = #submitted;
      createdTimestamp = 1718265600000000000;
      updatedTimestamp = 1718265600000000000;
      adminRemark = null;
      submittedBy = Principal.fromText("2vxsx-fae");
    },
    {
      id = "GRV-20240610-5";
      citizenName = "Anil Sharma";
      contactInfo = "9988776655";
      description = "Lack of street lighting in residential area posing safety concerns.";
      category = #public_safety;
      department = "Police & Safety Department";
      location = "Sector 21";
      severity = #high;
      duration = "2 months";
      status = #resolved;
      createdTimestamp = 1718352000000000000;
      updatedTimestamp = 1718352000000000000;
      adminRemark = ? "Lights have been installed. Issue resolved.";
      submittedBy = Principal.fromText("2vxsx-fae");
    },
  ];

  public shared ({ caller }) func initialize() : async () {
    if (grievances.isEmpty()) {
      for (grievance in initialGrievances.values()) {
        grievances.add(grievance.id, grievance);
      };
      grievanceIdCounter := initialGrievances.size();
    };
  };
};

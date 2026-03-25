import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import List "mo:core/List";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  type Transaction = {
    id : Nat;
    date : Text;
    time : Text;
    type_ : Text;
    amount : Float;
    partyName : Text;
    transactionId : Text;
    utrNo : Text;
    account : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  type UserData = {
    var nextTransactionId : Nat;
    transactions : List.List<Transaction>;
    var currency : Text;
  };

  let users = Map.empty<Principal, UserData>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Helper functions
  func ensureUserData(caller : Principal) : UserData {
    switch (users.get(caller)) {
      case (null) {
        let newUser : UserData = {
          var nextTransactionId = 0;
          transactions = List.empty<Transaction>();
          var currency = "INR";
        };
        users.add(caller, newUser);
        newUser;
      };
      case (?user) { user };
    };
  };

  func getUserDataReadOnly(caller : Principal) : ?UserData {
    users.get(caller);
  };

  // User Profile Functions (required by instructions)
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

  // Transaction Management Functions

  public shared ({ caller }) func addTransaction(transaction : Transaction) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add transactions");
    };

    let user = ensureUserData(caller);
    let newTransaction : Transaction = {
      transaction with id = user.nextTransactionId;
    };
    user.transactions.add(newTransaction);
    user.nextTransactionId += 1;
    newTransaction.id;
  };

  public query ({ caller }) func getTransactions() : async [Transaction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get transactions");
    };

    switch (getUserDataReadOnly(caller)) {
      case (null) { [] };
      case (?user) { user.transactions.toArray() };
    };
  };

  public shared ({ caller }) func deleteTransaction(transactionId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete transactions");
    };

    let user = ensureUserData(caller);
    let newTransactions = user.transactions.filter(
      func(t) {
        t.id != transactionId;
      }
    );
    user.transactions.clear();
    user.transactions.addAll(newTransactions.values());
  };

  public shared ({ caller }) func clearAllTransactions() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can clear transactions");
    };

    let user = ensureUserData(caller);
    user.transactions.clear();
    user.nextTransactionId := 0;
  };

  // Currency Management Functions

  public shared ({ caller }) func setCurrency(currency : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set currency");
    };

    let user = ensureUserData(caller);
    user.currency := currency;
  };

  public query ({ caller }) func getCurrency() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get currency");
    };

    switch (getUserDataReadOnly(caller)) {
      case (null) { "INR" };
      case (?user) { user.currency };
    };
  };
};

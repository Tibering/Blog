# Chapter Six. Integrity Constraints

**I've touched on the issue of `integrity constraints` at many points in preceding chapters**, but it's time to get more specific. Here first is a rough definition, repeated from Chapter 1: an `integrity constraint` (`constraint` for short) is basically just a `boolean expression` that must evaluate to `TRUE`. `Constraints` are so called because they constrain the values that can legally appear in some particular context. The ones we're interested in fall into two broad categories, `type constraints` and `database constraints`; in essence, a `type constraint` defines the values that constitute a given `type`, and a `database constraint` defines the values that can appear in a given `database`.

By the way, it's worth noting right away that `constraints` in general can be regarded as a formal version of what some people call `business rules`. I'll touch on this point again in the next chapter.

## Type Constraints

As we saw in Chapter 2, one of the things we have to do when we define a `type` is specify the values that make up that `type`. Here's an example:

```
1  TYPE QTY
2       POSSREP QPR
3            { Q INTEGER
4                    CONSTRAINT Q ≥ 0 AND Q ≤ 5000 } ;
```

_`Explanation:`_

- Line 1 just says we're defining a `type` called `QTY` ("quantities").
- Line 2 says that quantities have a `possible representation` called `QPR`. Now, `physical representations` are always hidden from the user, as we know from Chapter 2. However, **`Tutorial D`** requires every `TYPE` statement to include at least one `POSSREP` specification,[^1] indicating that values of the `type` in question can "possibly be represented" in some specific way; and unlike `physical representations`, `possible representations`—which we usually abbreviate to just `possreps`—are definitely visible to the user (in the example, users definitely know that quantities have a `possrep` called `QPR`). Note very carefully, however, that there's absolutely no suggestion that the specified `possible representation` is the same as the `physical representation`, whatever that happens to be; it might be or it might not, but either way it makes no difference to the user.
- Line 3 says the `possrep` `QPR` has a single `component`, called `Q`, which is of `type` `INTEGER`; in other words, values of `type` `QTY` can "possibly be represented" by integers (and users are aware of this fact).
- Finally, line 4 specifies that those integers must lie in the range 0 to 5000 inclusive—and it's that fact that constitutes the `type constraint` for `type` `QTY`; in other words, valid quantities are precisely those that can possibly be represented by integers in the specified range.

Here's a slightly more complicated example:

```
  TYPE POINT
       POSSREP CARTESIAN { X NUMERIC, Y NUMERIC
               CONSTRAINT SQRT ( X ** 2 + Y ** 2 ) ≤ 100.0 } ;
```

`Type` `POINT` denotes points in two-dimensional space; it has a `possrep` `CARTESIAN` with two numeric `components` called `X` and `Y` (corresponding, presumably, to cartesian coordinates), and there's a `type constraint` that says, in effect, that the only points we're interested in are those that lie on or inside a circle with center the origin and radius 100.

### Selectors and THE\_ Operators

Before I continue with my discussion of `type constraints` as such, I'd like to digress for a few moments; the `QTY` and `POINT` examples raise a number of issues that I need to address somewhere, and here's as good a place as any.

Recall from Chapter 2 that user-defined `types` like `QTY` and `POINT` have associated `selector` and `THE_ operators`. Well, those operators are intimately related to the `possrep` notion; in fact, `selector operators` correspond one-to-one to `possreps`, and `THE_ operators` correspond one-to-one to `possrep components`. Here are some examples:

**`QPR ( 250 )`**
: This expression is a `selector invocation` for `type` `QTY`. The `selector` has the same name, `QPR`, as the sole `possrep` for that `type`; it takes an `argument` that corresponds to, and is of the same `type` as, the sole `component` of that `possrep`, and it returns a quantity (that is, a value of `type` `QTY`). _`Note:`_ In practice, `possreps` often have the same name as the associated `type`—I used different names in the `QTY` example to make it clear there's a logical difference between the `possrep` and the `type`, but it would be much more usual not to. In fact, there's a syntax rule that says we can omit the `possrep` name from the `TYPE` statement entirely if we want to, in which case it defaults to the associated `type` name. So let's change the `QTY` `type` definition accordingly:

```
TYPE QTY POSSREP { Q INTEGER CONSTRAINT Q ≥ 0 AND Q ≤ 5000 } ;
```

Now the `possrep` and the corresponding `selector` are both called `QTY`, and the `selector invocation` shown earlier becomes just `QTY(250)`—which is the style I've been using for `selectors` throughout this book prior to this point. I'll assume this revised definition for `type` `QTY` for the rest of this chapter.

**`QTY ( A + B )`**
: The `argument` to a `QTY selector invocation` can be specified as an arbitrarily complex expression (just so long as it's of `type` `INTEGER`, of course). If that expression is a `literal`, as it was in the previous example, the `selector invocation` is a `literal` in turn; in other words, a `literal` is a special case of a `selector invocation`, as we already know from Chapter 3.

**`THE_Q ( QZ )`**
: This expression is a `THE_ operator invocation` for `type` `QTY`. The operator is named `THE_Q` because `Q` is the name of the sole `component` of the sole `possrep` for `type` `QTY`; it takes an `argument` (specified as an arbitrarily complex expression) of `type` `QTY`; and it returns the integer that's the `Q` `component` of the `possrep` for that `argument`.

Now let's redefine `type` `POINT` to make its `possrep` have the same name as the `type` (for simplicity, let's also drop the `type constraint`, at least for the time being):

```
  TYPE POINT POSSREP { X NUMERIC, Y NUMERIC } ;
```

To continue with the examples:

**`POINT ( 5.7, -3.9 )`**
: This is a `POINT selector invocation` (actually a `POINT literal`).

**`THE_X ( P )`**
: This expression returns the `NUMERIC` value that's the `X` coordinate of the cartesian `possible representation` of the point that's contained in the variable `P`. (That variable must be of `type` `POINT`, of course.)

By the way, `POINT` is a good example of a `type` for which we might want to define more than one `possrep`—for example:

```
  TYPE POINT POSSREP CARTESIAN { X NUMERIC, Y NUMERIC }
           POSSREP POLAR { R NUMERIC, THETA NUMERIC } ;
```

The two `possreps` here reflect the fact that points in two-dimensional space can indeed "possibly be represented" by either cartesian or polar coordinates. Each `possrep` has two `components`, both of `type` `NUMERIC` and both user-visible. Continuing with the examples:

**`POLAR ( H, K )`**
: This is a `POLAR selector invocation`; it returns a value of `type` `POINT`.

**`THE_THETA ( P )`**
: This expression returns the `NUMERIC` value that's the `THETA` coordinate of the polar `possible representation` of the point that's contained in the variable `P` (which again must be of `type` `POINT`).

### Type Constraints Continued

Now let's get back to `type constraints` as such. Suppose I had defined `type` `QTY` as follows, with no explicit `constraint`:

```
  TYPE QTY POSSREP { Q INTEGER } ;
```

This definition is defined to be shorthand for this one:

```
  TYPE QTY POSSREP { Q INTEGER CONSTRAINT TRUE } ;
```

With either of these definitions, anything that can possibly be represented by an integer would be a legitimate `QTY` value (and so `type` `QTY` would still be subject to a certain `constraint`, albeit a fairly weak one). In other words, the specified `possrep` imposes a kind of _`a priori`_ `type constraint`, and the `CONSTRAINT` specification if present imposes an additional `constraint`, over and above that _`a priori`_ one. Informally, however, we usually take the term "`type constraint`" to refer to what's stated in the `CONSTRAINT` specification.

One important issue I've ducked so far is the question of when `type constraints` are checked. In fact, they're checked _`whenever some selector is invoked`_. Assume again that values of `type` `QTY` are subject to the `constraint` that they must be possibly representable as integers in the range 0 to 5000. Then the expression `QTY(250)` is an invocation of the `QTY selector`, and that invocation succeeds. By contrast, the expression `QTY(6000)` is also such an invocation, but it fails. In general, in fact, we can _`never`_ tolerate an expression that's supposed to denote a value of some `type` _`T`_ but in fact doesn't; indeed, "a value of `type` _`T`_" that's not a value of `type` _`T`_ is a contradiction in terms. As a consequence, no variable—in particular, no `relvar`—can ever be assigned a value that's not of the right `type`.

_`A note on SQL:`_ You will have noticed that all of my examples in this section have been expressed in **`Tutorial D`**, not `SQL`. That's because, believe it or not, `SQL` doesn't support `type constraints` at all—except for the rather trivial _`a priori`_ ones, of course.[^2] In other words, although `SQL` would let you define `type` `QTY` (for example) and specify that quantities must be representable as integers, it would _`not`_ let you say those integers must lie in a certain range. For such reasons among others, I don't want to consider `SQL` user-defined `types` in detail in this book. However, I will at least show `SQL` counterparts to the **`Tutorial D`** `QTY` and `POINT` definitions that we've already seen:

```
  CREATE TYPE QTY AS INTEGER FINAL ;

  CREATE TYPE POINT AS ( X NUMERIC, Y NUMERIC ) NOT FINAL ;
```

One last point to close this section: defining anything to be of some particular `type` imposes a `constraint` on that thing, of course. In particular, defining `attribute` `QTY` of `relvar` `SP` (for example) to be of `type` `QTY` imposes the `constraint` that no `tuple` in `relvar` `SP` will ever contain a value in the `QTY` position that fails to satisfy the `QTY type constraint`. (This is an example of what's sometimes called an `attribute constraint`.)

## Database Constraints

To recap, a `database constraint` constrains the values that can appear in a given `database`. In **`Tutorial D`**, such `constraints` are specified by means of a `CONSTRAINT` statement (or by some shorthand that's effectively equivalent to such a statement); in `SQL`, they're specified by means of a `CREATE ASSERTION` statement (or, again, by some equivalent shorthand). I don't want to get into details of those shorthands—at least, not yet—because they're really just a matter of syntax; for now, let's stay with the "`longhand`" forms. I'll begin with a series of examples (**`Tutorial D`** on the left and `SQL` on the right, as usual).

### Example 1

Status values must be in the range 1 to 100 inclusive:

```
  CONSTRAINT C1 IS_EMPTY        | CREATE ASSERTION C1 CHECK
  ( S WHERE STATUS < 1       | ( NOT EXISTS
      OR    STATUS > 100 ) ; | ( SELECT S.* FROM S
                                |   WHERE  S.STATUS < 1
                                |   OR     S.STATUS > 100 ) ) ;
```

This `constraint` involves just a single `attribute` of a single `relvar`; as a consequence, it can be checked for a given supplier `tuple` by examining just that `tuple` in isolation—there's no need to look at any other `tuples` in the `relvar` or any other `relvars` in the `database`. (For this reason, such `constraints` are sometimes referred to, informally, as `tuple constraints`.)

### Example 2

Suppliers in London must have status 20:

```
  CONSTRAINT C2 IS_EMPTY        | CREATE ASSERTION C2 CHECK
  ( S WHERE CITY = 'London'     | ( NOT EXISTS
      AND   STATUS ≠ 20 ) ;  | ( SELECT S.* FROM S
                                |   WHERE  S.CITY = 'London'
                                |   AND    S.STATUS <> 20 ) ) ;
```

This `constraint` involves two distinct `attributes` (of the same `relvar`), but it's still the case, as it was with `constraint` `C1`, that it can be checked for a given supplier `tuple` by examining just that `tuple` in isolation.

### Example 3

No two `tuples` in `relvar` `S` have the same supplier number (in other words, {`SNO`} is a `key` for that `relvar`):[^3]

```
  CONSTRAINT C3             |   CREATE ASSERTION C3 CHECK
     COUNT ( S ) =          |  ( UNIQUE ( SELECT S.SNO
     COUNT ( S { SNO } ) ;  |             FROM   S ) ) ;
```

Like `constraints` `C1` and `C2`, this `constraint` still involves just one `relvar`; however, it clearly can't be checked for a given supplier `tuple` by examining just that `tuple` in isolation. Of course, it's very unlikely in practice that `constraint` `C3` would be specified in `longhand` as shown—some kind of explicit `KEY` shorthand is obviously to be preferred. I give the `longhand` form merely to make the point that such shorthands are indeed, in the final analysis, just shorthands.

By the way, the `SQL` formulation of `constraint` `C3` needs a word of explanation. `UNIQUE` is an `SQL` operator that returns `TRUE` if and only if every row within its argument table is distinct; the `UNIQUE` invocation in the `constraint` thus returns `TRUE` if and only if no two rows in table `S` have the same supplier number. But note that if I had followed my preferred discipline of always specifying `DISTINCT`, thus:

```
  UNIQUE ( SELECT DISTINCT S.SNO FROM S )
```

then the `UNIQUE` couldn't possibly return `FALSE`! In fact, `UNIQUE` makes no sense from a `relational` point of view; it's needed in `SQL` only because `SQL tables` aren't `relations`, in general.

Here for interest is an `SQL` formulation of `constraint` `C3` that more closely resembles the **`Tutorial D`** formulation:

```
  CREATE ASSERTION C3 CHECK
   ( ( SELECT COUNT ( * ) FROM S ) =
     ( SELECT COUNT ( SNO ) FROM S ) ) ;
```

### Example 4

No supplier with status less than 20 can supply part `P6`:

```
  CONSTRAINT C4 IS_EMPTY       | CREATE ASSERTION C4 CHECK
  ( ( S JOIN SP )              | ( NOT EXISTS
    WHERE STATUS < 20       | ( SELECT *
    AND   PNO = PNO('P6') ) ;  |   FROM   S, SP
                               |   WHERE  S.SNO = SP.SNO
                               |   AND    S.STATUS < 20
                               |   AND    SP.PNO = PNO('P6') ) ) ;
```

This `constraint` involves—in fact, interrelates—two distinct `relvars`, `S` and `SP`; in general, of course, a `database constraint` might involve or interrelate any number of distinct `relvars`.

> **Note**
>
> _`Terminology:`_ A `constraint` that involves just a single `relvar` is known, informally, as a `relvar constraint` (sometimes a `single-relvar constraint`, for emphasis). A `constraint` that involves two or more distinct `relvars` is known, informally, as a `multi-relvar constraint`.

### Example 5

Every supplier number in `relvar` `SP` must appear in `relvar` `S`:

```
  CONSTRAINT C5                    | CREATE ASSERTION C5 CHECK
     SP { SNO } ⊆ S { SNO } ; | ( NOT EXISTS
                                   |    ( SELECT SP.SNO
                                   |      FROM   SP
                                   |      EXCEPT
                                   |      SELECT S.SNO
                                   |      FROM   S ) ) ;
```

As you can see, the **`Tutorial D`** formulation of this `constraint` involves a `relational comparison`. `SQL` doesn't support `relational comparisons`, however, and so we have to indulge in some circumlocution in the `SQL` formulation. Of course, given that {`SNO`} is a `key`—in fact, _`the`_ `key`—for `relvar` `S`, it's clear that `constraint` `C5` is basically just the `foreign key constraint` from `SP` to `S`. The usual `FOREIGN KEY` syntax can thus be regarded as shorthand for `constraints` like `C5`.

So when are `database constraints` checked? Conventional wisdom has it that `single-relvar constraint` checking is _`immediate`_ (meaning it's done whenever the `relvar` in question is updated), while `multi-relvar constraint` checking is _`deferred`_ to `end-of-transaction` ("`commit time`"). I want to argue, however, that _`all`_ `database constraint` checking must be `immediate`, and `deferred checking`—which is supported in the `SQL standard`, and indeed in some `SQL` products—is a logical mistake. In order to explain this unorthodox view, I need to digress for a moment to discuss `transactions`.

## Transactions

`Transaction theory` is a large topic in its own right. As mentioned in Chapter 4, however, it doesn't have much to do with the `relational model` as such (at least, not directly), and for that reason I don't want to discuss it in detail here. In any case, you're a `database` professional, and I'm sure you're familiar with basic `transaction` concepts. The standard reference—highly recommended, by the way—is _Transaction Processing: Concepts and Techniques_, by Jim Gray and Andreas Reuter (Morgan Kaufmann, 1993). All I want to do here is briefly review the so-called `ACID properties` of `transactions`.

`ACID` is an acronym; it stands for _`atomicity`_ - _`consistency`_ - _`isolation`_ - _`durability`_. Here are brief explanations:

**`Atomicity`**
: `Transactions` are "all or nothing."

**`Consistency`**
: Any given `transaction` transforms a `consistent state` of the `database` into another `consistent state`, without necessarily preserving `consistency` at all intermediate points.[^4]

**`Isolation`**
: Any given `transaction`'s updates are concealed from all other `transactions`, until such time as the given `transaction` commits.

**`Durability`**
: Once a given `transaction` commits, its updates survive in the `database`, even if there's a subsequent system crash.

Now, one argument in favor of `transactions` has always been that they're supposed to act as "`a unit of integrity`" (that's what the `consistency property` is all about). But I don't believe that argument; as I've more or less said already, I believe that _`statements`_ have to be that unit, and that `database constraints` must therefore be satisfied _`at statement boundaries`_. The section immediately following gives my justification for this position.

## Why Database Constraint Checking Must Be Immediate

I have at least five reasons for taking the position that `database constraints` must be satisfied at statement boundaries. The first and biggest one is as follows. As we know from Chapter 4, a `database` can be regarded as a collection of `propositions`, `propositions` that we believe are true. And if that collection is ever allowed to include any inconsistencies, then _`all bets are off`_. As I'll show in the section "Constraints and Predicates," later in this chapter, we can never trust the answers we get from an inconsistent `database`! While it might be true, thanks to the `isolation property`, that no more than one `transaction` ever sees any particular inconsistency, the fact remains that that particular `transaction` does see the inconsistency and can therefore produce wrong answers.

Now, I think this first argument is strong enough to stand on its own, but I'll give the other four arguments as well, for purposes of reference if nothing else. Second, then, I don't agree that any given inconsistency can be seen by only one `transaction`, anyway; that is, I don't believe in the `isolation property`. Part of the problem here is that the word _`isolation`_ doesn't mean the same in the world of `transactions` as it does in ordinary English—in particular, it doesn't mean that `transactions` can't communicate with one another. For if `transaction` _`T1`_ produces some result, in the `database` or elsewhere, that's subsequently read by `transaction` _`T2`_, then _`T1`_ and _`T2`_ aren't truly isolated from each other (and this remark applies regardless of whether _`T1`_ and _`T2`_ run concurrently or otherwise). In particular, therefore, if (a) _`T1`_ sees an inconsistent state of the `database` and therefore produces an incorrect result, and (b) that result is then seen by _`T2`_, then (c) the inconsistency seen by _`T1`_ has effectively been propagated to _`T2`_. In other words, it can't be guaranteed that a given inconsistency, if permitted, _`will`_ be seen by just one `transaction`, anyway.

Third, we surely don't want every program (or other "`code unit`") to have to cater for the possibility that the `database` might be inconsistent when it's invoked. There's a severe loss of orthogonality if a program that assumes consistency can't be used safely while constraint checking is deferred. In other words, I want to be able to specify code units independently of whether they're to be executed as a `transaction` as such or just as part of a `transaction`. (In fact, I'd like support for `nested transactions`, but that's a topic for another day.)

Fourth, _`The Principle of Interchangeability`_ (of `base relvars` and `views`—see Chapter 4) implies that the very same `constraint` might be a `single-relvar constraint` with one design for the `database` and a `multi-relvar constraint` with another. For example, recall these two `views` from Chapter 4:

```
    VAR LS  VIRTUAL ( S WHERE CITY = 'London' ) ;

    VAR NLS VIRTUAL ( S WHERE CITY ≠ 'London' ) ;
```

These `views` satisfy the `constraint` that no supplier number appears in both. However, there's no need to state that `constraint` explicitly, because it's implied by the `single-relvar constraint` that {`SNO`} is a `key` for `relvar` `S` (along with the fact that every supplier has exactly one city, which is implicit in the design of `relvar` `S`). But suppose we made `LS` and `NLS` `base relvars` and defined their union as a `view` called `S`. Then the `constraint` would have to be stated explicitly:

```
    CONSTRAINT C6 IS_EMPTY   |  CREATE ASSERTION C6 CHECK
     ( LS { SNO } JOIN       |  ( NOT EXISTS
      NLS { SNO } ) ;        |    ( SELECT *
                             |    FROM   LS, NLS
                             |  WHERE  LS.SNO = NLS.SNO ) ) ;
```

Now what was previously a `single-relvar constraint` has become a `multi-relvar constraint` instead. Thus, if we agree that `single-relvar constraints` must be checked `immediately`, we must surely agree that `multi-relvar constraints` must be checked `immediately` as well.

Fifth and last, there's an optimization technique called `semantic optimization` (it involves `expression transformation`, but I deliberately didn't discuss it in the section of that name in Chapter 5). For example, consider the expression `(SP JOIN S){PNO}`. Clearly, the `join` here is a `foreign-to-matching-primary-key join`; as a consequence, every `SP tuple` does join to some `S tuple` and therefore contributes a part number to the overall result. So there's no need to do the `join`!—the expression can be simplified to just `SP{PNO}`. The point to note, however, is that this transformation is valid _`only`_ because of the semantics of the situation; in general, each operand to a `join` will include some `tuples` that have no counterpart in the other operand and so don't contribute to the overall result, and transformations such as the one just shown therefore won't be valid. In the case at hand, however, every `SP tuple` _`must`_ have a counterpart in `S`, because of the `integrity constraint`—actually a `foreign key constraint`—that says that every shipment must have a supplier, and so the transformation is valid after all. A transformation that's valid only because a certain `integrity constraint` is in effect is called a `semantic transformation`, and the resulting optimization is called a `semantic optimization`.

In principle, any `constraint` whatsoever can be used in `semantic optimization` (we're not limited to `foreign key constraints`). For example, suppose the suppliers-and-parts `database` is subject to the `constraint` "`All red parts must be stored in London`," and consider the query:

> Get suppliers who supply only red parts and are located in the same city as at least one of the parts they supply.

This is a fairly complex query. But thanks to the `integrity constraint`, we see that it can be transformed—transformed by the optimizer, I mean, not by the user—into this much simpler one:

> Get London suppliers who supply only red parts.

We could easily be talking about several orders of magnitude improvement in performance here. And so, while few products do much in the way of `semantic optimization` at the time of writing (as far as I know), I certainly expect them to do more in the future, because the payoff is so dramatic.

To get back to the main thread of the discussion, I now observe that if a given `constraint` is to be usable in `semantic optimization`, that `constraint` must be satisfied _`at all times`_ (more precisely, at statement boundaries), not just at transaction boundaries. As we've seen, `semantic optimization` means using `constraints` to simplify queries in order to improve performance. Clearly, then, if some `constraint` is violated at some time, then any simplification based on that `constraint` won't be valid at that time, and query results based on that simplification will be wrong at that time (in general).

> **Note**
>
> Of course, we could adopt the weaker position that "`deferred constraints`" (meaning `constraints` for which the checking is deferred) just can't be used in `semantic optimization`—but I think such a position would effectively just mean we've shot ourselves in the foot, that's all.

In sum, then, `database constraints` must be satisfied—that is, they must evaluate to `TRUE`, given the values currently appearing in the `database`—_`at statement boundaries`_ (or, very informally, "`at semicolons`"); in other words, they must be checked at the end of any statement that might cause them to be violated. If any such check fails, the effects on the `database` of the offending statement are undone and an exception is raised.

## But Doesn't Some Checking Have to Be Deferred?

As I've said, the conventional wisdom is that `multi-relvar constraint` checking, at least, has to be deferred to `commit time` (the arguments of the previous section notwithstanding). By way of example, suppose the suppliers-and-parts `database` is subject to the following `constraint`:

```
  CONSTRAINT C7
    COUNT ( ( S WHERE SNO = SNO('S1') ) { CITY }
        UNION
        ( P WHERE PNO = PNO('P1') ) { CITY } ) < 2 ;
```

This `constraint` says that supplier `S1` and part `P1` must never be in different cities. To elaborate: if `relvars` `S` and `P` contain `tuples` for supplier `S1` and part `P1`, respectively, then those `tuples` must contain the same `CITY` value (if they didn't, the `COUNT` invocation would return the value two). However, it's legal for `relvar` `S` to contain no `tuple` for `S1`, or `relvar` `P` to contain no `tuple` for `P1`, or both (in which case the `COUNT` invocation will return either one or zero). Given our usual sample values, then, each of the following `SQL UPDATE`s will fail under `immediate checking`:[^5]

```
  UPDATE S SET CITY = 'Paris' WHERE SNO = SNO('S1') ;

  UPDATE P SET CITY = 'Paris' WHERE PNO = PNO('P1') ;
```

Now, the conventional solution to this problem is to defer the checking and to bundle up the two `UPDATE`s into a `transaction`, like this:

```
  BEGIN TRANSACTION ;
  UPDATE S SET CITY = 'Paris' WHERE SNO = SNO('S1') ;
  UPDATE P SET CITY = 'Paris' WHERE PNO = PNO('P1') ;
  COMMIT ;
```

In this conventional solution, the `constraint` is checked at `commit time`, and the `database` is inconsistent between the two `UPDATE`s. In particular, if the `transaction` were to ask the question "`Are supplier S1 and part P1 in different cities?`" between the two `UPDATE`s (and if we assume that `tuples` for `S1` and `P1` do exist), it would get the answer _`yes`_.

### Multiple Assignment

A better solution to the foregoing problem is to support a _`multiple`_ form of assignment, which allows any number of individual assignments to be performed "`simultaneously.`" For example (switching back now to **`Tutorial D`**):

```
  UPDATE S WHERE SNO = SNO('S1') ( CITY := 'Paris' ) ,
  UPDATE P WHERE PNO = PNO('P1') ( CITY := 'Paris' ) ;
```

_`Explanation:`_ First, note the comma separator, which means the two `UPDATE`s are part of the same overall statement. Second, `UPDATE` is really assignment, of course, and the foregoing "`double UPDATE`" is thus just shorthand for a `double assignment` of the following general form:

```
  S := ... , P := ... ;
```

This `double assignment` assigns one value to `relvar` `S` and another to `relvar` `P`, all as part of the same overall operation. In general, the semantics of `multiple assignment` are as follows:

- First, all of the expressions on the right sides are evaluated.
- Second, all of the constituent assignments are then executed in sequence as written.[^6]

Observe that, precisely because the expressions on the right sides are evaluated before any constituent assignment is executed, none of those constituent assignments can depend on the result of any other. Moreover, since `multiple assignment` is considered to be a single operation, no integrity checking is performed "`in the middle of`" any such assignment. (Indeed, this fact is the major rationale for supporting `multiple assignment` in the first place.) In the example, therefore, the `double assignment` succeeds where the two separate single assignments failed.

Note in particular in the example that there's now no way for the `transaction` to see an inconsistent state of the `database` between the two `UPDATE`s, because the notion of "`between the two UPDATE`s`" now has no meaning. Note further that there's now no need for deferred checking at all.

By the way, `SQL` does have some support for `multiple assignment`; in fact, it's had _`some`_ support for many years. First, `referential actions` such as `CASCADE` imply, in effect, that a single `DELETE` or `UPDATE` statement can cause several tables to be updated "`at the same time`," as part of a single operation. Second, the ability to update (for example) certain `join views` implies the same thing. Third, `FETCH INTO` and `SELECT INTO` are both `multiple assignment` operations, of a kind. Fourth, `SQL:2003` introduced a `multiple-assignment` form of the `SET` statement. And so on (this isn't an exhaustive list). However, the one kind of `multiple assignment` that `SQL` doesn't currently support is an explicit assignment to several different tables (precisely the case illustrated by the foregoing example, of course).

One last point: please understand that support for `multiple assignment` doesn't mean we can discard support for `transactions`; `transactions` are still necessary for recovery and concurrency purposes, at least. All I'm saying is that `transactions` aren't the "`unit of integrity`" they're usually supposed to be.

## Constraints and Predicates

Recall from Chapter 4 that the `relvar predicate` for a `relvar` is _`the intended interpretation`_—loosely, the _`meaning`_—for that `relvar`. For example, the `predicate` for `relvar` `S` looks like this:

> Supplier `SNO` is under contract, is named `SNAME`, has status `STATUS`, and is located in city `CITY`.

In an ideal world, therefore, this `predicate` would serve as the criterion for acceptability of updates on `relvar` `S`—that is, it would dictate whether a given `INSERT` or `DELETE` or `UPDATE` operation on that `relvar` can be accepted. But this goal is clearly unachievable:

- For one thing, the system can't know what it means for a "`supplier`" to be "`under contract`" or to be "`located`" somewhere; to repeat, these are matters of interpretation. For example, if the supplier number `S1` and the city name `London` happen to appear together in the same `tuple`, then the user can interpret that fact to mean that supplier `S1` is located in `London`,[^7] but there's no way the system can do anything analogous.
- For another, even if the system could know what it means for a supplier to be under contract or to be located somewhere, it still couldn't know _`a priori`_ whether what the user tells it is true! If the user asserts to the system, by means of some update, that there's a supplier `S6` named `Lopez` with status 30 and city `Madrid`, there's no way for the system to know whether that assertion is true. All the system can do is check that the user's assertion doesn't violate any `integrity constraints`. Assuming it doesn't, then the system will accept the user's assertion _`and will treat it as true from that point forward`_ (until such time as the user tells the system, by executing another update, that it isn't true anymore).

Thus, the _`pragmatic`_ "`criterion for acceptability of updates`," as opposed to the ideal one, is not the `predicate` but the corresponding set of `constraints`, which might thus be regarded as the system's approximation to the `predicate`.[^8] Equivalently:

> The system can't enforce truth, only consistency.

In other words: the system can't guarantee that the `database` contains only true `propositions`—it can guarantee only that it doesn't contain anything that violates any `constraint` (meaning it contains no inconsistencies). Sadly, truth and consistency aren't the same thing. To be specific:

- If the `database` contains only true `propositions`, then it's consistent, but the converse isn't necessarily so.
- If the `database` is inconsistent, then it contains at least one false `proposition`, but the converse isn't necessarily so.

More succinctly, _`correct`_ implies _`consistent`_ (but not the other way around), and _`inconsistent`_ implies _`incorrect`_ (but not the other way around)—where to say that the `database` is _`correct`_ is to say it faithfully reflects the true state of affairs in the real world, no more and no less.

Now let me try to pin down these notions a little more precisely. Let _`R`_ be a `base relvar`—I'll get to `views` in just a moment—and let _`C1, C2, . . . , Cn`_ be all of the defined `database constraints`, single- or multi-relvar, that mention _`R`_. Assume for simplicity that each _`Ci`_ is just a `boolean expression` (in other words, let's ignore the `constraint` names, for simplicity). Then the `boolean expression`:

```
  ( C1 ) AND ( C2 ) AND ... AND ( Cn ) AND TRUE
```

is _`the total relvar constraint`_ for `relvar` _`R`_ (but I'll refer to it for the purposes of this book as just _`the`_ `constraint` for _`R`_). Note that final "`AND TRUE`," by the way; the implication is that if no `constraints` are defined for a given `relvar`, the default is just `TRUE`.

Now let _`RC`_ be "`the`" `relvar constraint` for `relvar` _`R`_. Clearly, _`R`_ must never be allowed to have a value that causes _`RC`_ to evaluate to `FALSE`. This state of affairs is the motivation for (the first version of) what I like to call _`The Golden Rule`_:

> No update operation must ever cause any relvar constraint to evaluate to FALSE.

Now let _`V`_ be a `view`. Then _`V`_ too has a "`total relvar constraint`" (which I'll usually abbreviate to just _`the`_ `constraint` for _`V`_, for simplicity), derived in an obvious manner from the `constraints` that apply to the `relvars` in terms of which _`V`_ is defined. For example, let _`SC`_ be the total `constraint` for `base relvar` `S`. Then the total `constraint` for `view` `LS` ("`London suppliers`") is:

```
  ( SC ) AND ( CITY = 'London' )
```

Now let _`DB`_ be a `database`, and let _`DB`_ contain `relvars` _`R1, R2, . . . , Rn`_ (only). Let the `constraints` for those `relvars` be _`RC1, RC2, . . . , RCn`_, respectively. Then _`the total database constraint`_ for _`DB`_, _`DBC`_ say—which I'll refer to for the purposes of this book as just _`the`_ `constraint` for _`DB`_—is the `AND` of all of those `relvar constraints`:

```
  ( RC1 ) AND ( RC2 ) AND ... AND ( RCn )
```

And here's a correspondingly extended (in fact, the final) version of _`The Golden Rule`_:

> No update operation must ever cause any database constraint to evaluate to FALSE.

Observe in particular that—in accordance with my position that all integrity checking must be immediate—the rule talks in terms of update operations, not transactions.

Now I can take care of a piece of unfinished business. I've said we can never trust the answers we get from an inconsistent `database`. Here's the proof. As we know, a `database` can be regarded as a collection of `propositions`. Suppose that collection is inconsistent; that is, suppose it implies that both _`p`_ and NOT _`p`_ are true, where _`p`_ is some `proposition`. Now let _`q`_ be any arbitrary `proposition`. Then:

- From the truth of _`p`_, we can infer the truth of _`p`_ OR _`q`_.
- From the truth of _`p`_ OR _`q`_ and the truth of NOT _`p`_, we can infer the truth of _`q`_.

But _`q`_ was arbitrary! It follows that any `proposition` whatsoever (even obviously false ones like 1 = 0) can be shown to be true in an inconsistent system.

## Miscellaneous Issues

In this section, I want to address a few integrity-related issues that don't fit very well in any of the preceding sections.

First, since it's basically a `boolean expression` that must evaluate to `TRUE`, it follows that from a formal perspective a `constraint` is a `proposition`. Here for example is `constraint` `C1` from the earlier section "Database Constraints":

```
  CONSTRAINT C1 IS_EMPTY ( S WHERE STATUS < 1 OR STATUS > 100 ) ;
```

Given a particular value for `relvar` `S`, the `boolean expression`:

```
  IS_EMPTY ( S WHERE STATUS < 1 OR STATUS > 100 )
```

(which might be thought of, loosely, as the `constraint proper`) is certainly either true or false, unconditionally, and that's the definition of what it means to be a `proposition` (see Chapter 4).

Second, suppose `relvar` `S` already contains a `tuple` that violates `constraint` `C1` when the `CONSTRAINT` statement just shown is executed. Then that execution must fail, of course. More generally, whenever we try to define a new `database constraint`, the system must first check to see whether that `constraint` is satisfied by the `database` at that time. If it isn't, the `constraint` must be rejected; otherwise, it must be accepted and enforced from that point forward.

Third, recall from Chapter 1 that the `relational model` includes what I called a "`generic`" `integrity rule`: namely, the `referential integrity rule` (I deliberately ignore the `entity integrity rule`). But it should be clear that the `referential integrity rule` is different in kind from the `constraints` we've been examining in this chapter. It's really a _`metaconstraint`_, in a sense; it says, for example, that in the specific `database` containing `relvars` `S`, `P`, and `SP`, there must be certain specific `constraints` (`foreign key constraints`) between `SP` and `S` and between `SP` and `P`—because if there aren't, then that `database` might violate the `referential integrity metaconstraint`. Likewise, in the specific `database` containing `relvars` `EMP` and `DEPT` (see Chapter 1), there must be a specific `foreign key constraint` between `EMP` and `DEPT`, because if there isn't, then again that `database` might violate the `referential integrity metaconstraint`.

Fourth, I never mentioned the point explicitly, but I trust it's obvious that we want `constraints` to be stated _`declaratively`_. Although the `SQL standard` does include fairly extensive support for `declarative constraints`, at least some of the major `SQL` products don't; instead, they assume you'll use `triggered procedures`—also known as just `triggers`—to enforce integrity. (The standard includes explicit support for `triggers`, too.) As I pointed out in Chapter 1, however, `declarative solutions` are always to be preferred over `procedural ones`, if they're available. Also, `declarative constraints` in particular open the door to the possibility of doing `semantic optimization`, which `triggers` don't.

Another issue I didn't mention previously is the possibility of supporting `transition constraints`. A `transition constraint` is a constraint on the legal transitions that variables of some kind (`relvars` in particular) can make from one value to another. For example, a person's marital status can change from "`never married`" to "`married`" but not the other way around. Here's an example ("`No supplier's status must ever decrease`"):

```
  CONSTRAINT C8 IS_EMPTY
     ( ( ( S' { SNO, STATUS } RENAME ( STATUS AS STATUS' ) )
       JOIN
       ( S { SNO, STATUS } ) )
     WHERE STATUS' > STATUS ) ;
```

_`Explanation:`_ I'm adopting the convention that a primed `relvar` name such as `S'` refers to the indicated `relvar` as it was _`prior to the update under consideration`_. `Constraint` `C8` thus says: "`If we join the old value of S and the new one and restrict the result to just those tuples where the old status is greater than the new one, the final result must be empty.`" (Since the `join` is on `SNO`, any `tuple` in the `join` for which the old status is greater than the new one would represent a supplier whose status had decreased.)

Last, I hope you agree from everything we've covered in this chapter that `constraints` are _`vital`_—and yet they seem to be very poorly supported in commercial products; indeed, they seem to be underappreciated at best, if not completely misunderstood. The emphasis in the commercial world always seems to be on _`performance, performance, performance`_; other objectives, such as ease of use, `data independence`, and in particular integrity, seem so often to be sacrificed to—or at best to take a back seat to—that overriding goal.[^9] But what's the point of a system performing well if we can't be sure the information we're getting from it is correct? Frankly, I don't care how fast a system runs if I don't feel I can trust it to give me the right answers to my queries.

## Summary

I've discussed two basic kinds of `constraints`, `type constraints` and `database constraints`. A `type constraint` defines the set of values that constitute a given `type`; in **`Tutorial D`**, it's specified as part of the definition of the `type` in question, and it's expressed in terms of a `possrep` (`possible representation`) for that `type`. The `possrep` itself imposes an _`a priori`_ `constraint` on the `type` (and `SQL` doesn't support any `type constraints` apart from such _`a priori`_ ones). `Type constraints` are checked as part of the execution of `selector operators`. As a digression, I elaborated on the notion of `selectors` and the related notion of `THE_ operators`, both of which are intimately related to the `possrep` notion.

`Database constraints` constrain the values that can appear in a given `database` (if they apply to just one `relvar`, they're sometimes referred to, informally, as `relvar constraints`). They're specified by means of a `CONSTRAINT` statement in **`Tutorial D`** or a `CREATE ASSERTION` statement in `SQL`, and they're supposed to be checked "`at semicolons`" (though they might not be, in `SQL`). Checking `constraints` at semicolons means checking them at the end of any statement that might cause them to be violated—which basically means `relational assignments`, since `relational assignment` is fundamentally the only operation that can update the `database`. I gave a series of arguments for rejecting the conventional wisdom that `multi-relvar constraints`, at least, need not be checked until `commit time` (and in passing I briefly discussed the notion of `semantic optimization`). I also introduced the important idea of `multiple assignment`.

Next, I showed that "`the`" `relvar constraint` for `relvar` _`R`_ might be regarded as the system's approximation to the `relvar predicate` for _`R;`_ in particular, it serves as the criterion for acceptability of updates on _`R`_. "`The system can't enforce truth, only consistency.`" _`The Golden Rule`_ says:

> No update operation must ever cause any database constraint to evaluate to FALSE.

I concluded by claiming that integrity `constraints` are absolutely vital. To me, in fact, they're what database systems are all about. To say it again: I don't care how fast your system runs if I can't trust the answers it gives me.

## Exercises

### Exercise 6-1.

Define the terms _`type constraint`_ and _`database constraint`_. When are such `constraints` checked? What happens if the check fails?

### Exercise 6-2

State _`The Golden Rule`_.

### Exercise 6-3

What do you understand by the terms _`attribute constraint`_; _`tuple constraint`_; _`relvar constraint`_; _`"the" database constraint`_; _`"the" relvar constraint`_; _`single-relvar constraint`_; _`multi-relvar constraint?`_

### Exercise 6-4

Distinguish between `possible` and `physical representations`.

### Exercise 6-5

Explain as carefully as you can (a) what a `selector` is and (b) what a `THE_ operator` is.

### Exercise 6-6

Suppose the only legal `CITY` values are London, Paris, Rome, Athens, Oslo, Stockholm, Madrid, and Amsterdam. Define a `type` called `CITY` that satisfies this `constraint`. Is there a way to impose the same `constraint` without an explicit `CITY type`? If so, compare and contrast the different approaches.

### Exercise 6-7

Throughout this book I assume that `SNO` is a user-defined `type`. Give a definition for this `type`. Assume that the only legal supplier numbers are ones that can be represented by a character string of at least two characters, of which the first is an "`S`" and the remainder denote a decimal integer in the range 1 to 9999.

### Exercise 6-8

A _`line segment`_ is a straight line connecting two points in the euclidean plane. Give a corresponding `type` definition.

### Exercise 6-9

Can you think of a `type` for which we might want to specify two different `possreps`? If there are two or more `possreps` for the same `type`, does it make sense for each to include a `type constraint`?

### Exercise 6-10

Can you think of an example of a `type` for which different `possreps` have different numbers of `components`?

### Exercise 6-11

Which operations might cause `constraints` `C1`-`C8` from the body of the chapter to be violated?

### Exercise 6-12

`Constraint` `C1` (for example) had the property that it could be checked for a given `tuple` by examining just that `tuple` in isolation; `constraint` `C4` (for example) did not. What is it, formally, that accounts for this difference? What's the pragmatic significance, if any, of this difference?

### Exercise 6-13

Can you give a **`Tutorial D`** `database constraint` that's _`exactly`_ equivalent to the specification `KEY{SNO}` for `relvar` `S`?

### Exercise 6-14

Give an `SQL` formulation of `constraint` `C7` from the body of the chapter.

### Exercise 6-15

Give an `SQL` formulation of `constraint` `C8` from the body of the chapter.

### Exercise 6-16

Using **`Tutorial D`** and/or `SQL`, write `constraints` for the suppliers-and-parts `database` to express the following requirements:

1. All red parts must weigh less than 50 pounds.
2. Every London supplier must supply part `P2`.
3. No two suppliers can be located in the same city.
4. At most one supplier can be located in Athens at any one time.
5. There must exist at least one London supplier.
6. At least one red part must weigh less than 50 pounds.
7. The average supplier status must be at least 10.
8. No shipment can have a quantity more than double the average of all such quantities.
9. No supplier with maximum status can be located in the same city as any supplier with minimum status.
10. Every part must be located in a city in which there is at least one supplier.
11. Every part must be located in a city in which there is at least one supplier of that part.
12. Suppliers in London must supply more different kinds of parts than suppliers in Paris.
13. Suppliers in London must supply more parts in total than suppliers in Paris.

In each case, state which operations might cause the `constraint` to be violated.

### Exercise 6-17

In a footnote in the section "Constraints and Predicates," I said that if the values `S1` and `London` appeared together in some `tuple`, then it might mean (among many other possible interpretations) that supplier `S1` doesn't have an office in `London`. Actually, this particular interpretation is extremely unlikely. Why? (_`Hint:`_ Remember the `Closed World Assumption`.)

### Exercise 6-18

Suppose no "`cascade delete`" rule is stated declaratively for suppliers and shipments. Write a **`Tutorial D`** statement that will delete some specified supplier and all shipments for that supplier in a single operation.

### Exercise 6-19

Using the syntax sketched for `transition constraints` in the section "Miscellaneous Issues," write `transition constraints` to express the following requirements:

1. Suppliers in Athens can move only to London or Paris, and suppliers in London can move only to Paris.
2. The total shipment quantity for a given part can never decrease.
3. The total shipment quantity for a given supplier cannot be reduced in a single update to less than half its current value. (What do you think the qualification "`in a single update`" means here? Why is it important? _`Is`_ it important?)

### Exercise 6-20

Distinguish between `correctness` and `consistency`.

### Exercise 6-21

Do you think the following is or should be a valid **`Tutorial D`** `TYPE` statement?

```
  TYPE TTT POSSREP { ... CONSTRAINT FALSE } ;
```

### Exercise 6-22

Do you think the following is or should be a valid **`Tutorial D`** `CONSTRAINT` statement?

```
  CONSTRAINT FFF FALSE ;
```

### Exercise 6-23

Investigate any `SQL` product that might be available to you. What `semantic optimization` does it support, if any?

### Exercise 6-24

Why do you think `SQL` fails to support `type constraints`? What are the consequences of this state of affairs?

### Exercise 6-25

The discussion in this chapter of `types` in general, and `type constraints` in particular, tacitly assumed that `types` were all (a) scalar and (b) user-defined. Do the concepts discussed apply equally well to nonscalar `types` and/or system-defined `types`?

---

[^1]: There are some minor exceptions to this rule that need not concern us here.

[^2]: It doesn't support `possreps`, either. As for `selectors` and `THE_ operators`, the picture is too complicated to describe in detail here; suffice it to say that analogs of those operators are usually available, though they're not always provided "`automatically`" as they are in **`Tutorial D`**.

[^3]: Or a _`superkey`_, rather. A `superkey` is a superset of a `key`. See Chapter 7 for further discussion.

[^4]: A `database state` is _`consistent`_ if and only if it satisfies all defined `constraints` (`consistency` is just another word for `integrity` in this context).

[^5]: I show those `UPDATE`s in `SQL` precisely because checking _`is`_ immediate in **`Tutorial D`** and the conventional solution I'll be discussing in a moment therefore doesn't work in **`Tutorial D`**.

[^6]: This definition requires some slight refinement in the case where two or more of the individual assignments specify the same target. The details are beyond the scope of this book.

[^7]: Or that supplier `S1` _`used to be`_ located in `London`, or that supplier `S1` _`has an office`_ in `London`, or that supplier `S1` _`doesn't`_ have an office in `London`, or any of an infinite number of other possible interpretations (corresponding, of course, to an infinite number of possible `predicates`).

[^8]: Precisely for this reason, I've elsewhere used the term _`internal predicate`_ to refer to `constraints` and the term _`external predicate`_ to refer to what I'm here calling the `relvar predicate`.

[^9]: I don't mean to suggest that proper support for integrity checking implies bad performance; in fact, I believe quite strongly that it should _`improve`_ performance. All I mean is that there tends to be a huge emphasis in vendor development effort on performance issues, to the exclusion of other matters such as data integrity.

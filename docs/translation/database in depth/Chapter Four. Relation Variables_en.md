# Chapter Four. Relation Variables

**We saw in Chapter 1 that a `relation variable` (`relvar` for short) is a `variable` whose** permitted `values` are `relations`, and that it's specifically `relvars`, not `relations`, that are the target for `INSERT`, `DELETE`, and `UPDATE` `operations`. We also saw that `INSERT`, `DELETE`, and `UPDATE` are all just shorthand for certain `relational assignments`. I remind you too that (a) if _`R`_ is a `relvar` and _`r`_ is a `relation` to be assigned to _`R`_, then _`R`_ and _`r`_ must be of the same `relation type`, and (b) the terms _`heading`_, _`body`_, _`attribute`_, _`tuple`_, _`cardinality`_, and _`degree`_, formally defined in Chapter 3 for `relations`, can all be interpreted in the obvious way to apply to `relvars` as well. Now it's time to take a closer look at these matters. As a basis for examples, I'll use the following **`Tutorial D`** definitions for the `base relvars` in the suppliers-and-parts `database`:

```
VAR S BASE RELATION
  { SNO SNO, SNAME NAME, STATUS INTEGER, CITY CHAR }
    KEY { SNO } ;

VAR P BASE RELATION
  { PNO PNO, PNAME NAME, COLOR COLOR, WEIGHT WEIGHT, CITY CHAR }
    KEY { PNO } ;

VAR SP BASE RELATION
  { SNO SNO, PNO PNO, QTY QTY }
    KEY { SNO, PNO }

    FOREIGN KEY { SNO } REFERENCES S
    FOREIGN KEY { PNO } REFERENCES P ;
```

## Updating Is Set-at-a-Time

The first point I want to stress is that, regardless of what syntax we use to express it, `relational assignment` is a _`set-level`_ `operation`. (In fact, _`all`_ `operations` in the `relational model` are `set-level`, as we'll see in Chapter 5.) Thus, `INSERT` inserts a `set` of `tuples` into the target `relvar`; `DELETE` deletes a `set` of `tuples` from the target `relvar`; and `UPDATE` updates a `set` of `tuples` in the target `relvar`. Now, it's true that we often talk in terms of (for example) updating some individual `tuple` as such, but you need to understand that:

- Such talk really means the `set` of `tuples` we're updating just happens to have `cardinality` one.
- What's more, updating a `set` of `tuples` of `cardinality` one sometimes isn't possible anyway.

For example, suppose `relvar` `S` is subject to the `integrity constraint` (see Chapter 6) that suppliers `S1` and `S4` are always in the same city. Then any "`single-tuple UPDATE`" that tries to change the city for just one of those two suppliers will necessarily fail. Instead, we must update them both at the same time, perhaps like this (`SQL`):

```
UPDATE S
SET    CITY = 'New York'
WHERE  S.SNO = SNO('S1') OR S.SNO = SNO('S4') ;
```

What's being updated here is, obviously enough, a `set` of two `tuples`.

> **Note**
>
> Here, for interest, is the same update expressed in **`Tutorial D`** (it looks very similar, as you can see):
>
> ```
> UPDATE S WHERE SNO = SNO('S1') OR SNO = SNO('S4')
>        ( CITY := 'New York' ) ;
> ```

One consequence of the foregoing is that there's nothing in the `relational model` that resembles `SQL`'s "`positioned updates`" (that is, `UPDATE` or `DELETE` "`WHERE CURRENT OF cursor`"), because those `operations` are `tuple-level`, not `set-level`, by definition. They do happen to work in today's products, most of the time, but that's because those products aren't very good at supporting `integrity constraints`. If the products were to improve in that regard, those "`positioned updates`" might _`not`_ work any more; that is, applications that succeed today might fail tomorrow—not a very desirable state of affairs, it seems to me.

Now I need to 'fess up to something. The fact is, to talk as I've been doing of "`updating a tuple`"—or `set` of `tuples`, rather—is very imprecise (not to say sloppy) anyway. If _`V`_ is subject to update, then _`V`_ must be a _`variable`_ by definition, not a `value`, and `tuples`, like `relations`, are _`values`_ and can't be updated, again by definition. What we really mean when we talk of (for example) updating `tuple` _`t1`_ to _`t2`_, within some `relvar` _`R`_, is that we're _`replacing`_ `tuple` _`t1`_ in _`R`_ by another `tuple` _`t2`_. And that kind of talk is still sloppy! What we _`really`_ mean is that we're replacing the `relation` _`r1`_ that's the original `value` of _`R`_ by another `relation` _`r2`_. And what exactly is `relation` _`r2`_ here? Well, let _`s1`_ and _`s2`_ be `relations` containing just `tuple` _`t1`_ and `tuple` _`t2`_, respectively; then _`r2`_ is (_`r1`_ `MINUS` _`s1`_) `UNION` _`s2`_. In other words, "`updating tuple *`t1`* to *`t2`* in `relvar` *`R`*`" can be thought of as first deleting _`t1`_ and then inserting _`t2`_—if (despite everything I've been saying) I might be permitted to talk in terms of deleting and inserting individual `tuples` in this loose fashion.

In the same kind of way, it doesn't really make sense to talk in terms of "`updating attribute *`A`* within `tuple` *`t`*`"—or within `relation` _`r`_, or even within `relvar` _`R`_. Of course, we do it anyway, because it's convenient (it saves a lot of circumlocution); but it's like that business of user-friendly terminology I discussed in Chapter 1—it's OK to do it only if we all understand that such talk is only an approximation to the truth, and indeed it tends to obscure the essence of what's really going on.

## More on Candidate Keys

I explained the basic idea of `candidate keys` in Chapter 1, but now I want to make the concept more precise. Here's a definition:

> _`Definition:`_ Let _`K`_ be a _`subset`_ of the `heading` of `relvar` _`R`_. Then _`K`_ is a _`candidate key`_ (or just _`key`_ for short) for _`R`_ if and only if it possesses both of the following properties:

**`Uniqueness`**
: No possible `value` for _`R`_ contains two distinct `tuples` with the same `value` for _`K`_.

**`Irreducibility`**
: No _`proper subset`_ of _`K`_ has the `uniqueness` property.

> **Note**
>
> In accordance with usual practice, throughout this book I take statements of the form "`*`B`* is a `subset` of *`A`*`" and "`*`A`* is a *`superset`* of *`B`*`" to include the possibility that _`A`_ and _`B`_ might be equal. If I want to exclude that possibility, I'll talk explicitly in terms of _`proper`_ `subsets` and `supersets`.

Now, the `uniqueness` property is self-explanatory, but I need to say a bit more about the `irreducibility` property. Consider `relvar` `S` and the `set` of `attributes` {`SNO`,`CITY`}—let's call it `SK`—which is certainly a `subset` of the `heading` of `S` that has the `uniqueness` property (no `relation` that's a possible `S value` ever has two distinct `tuples` with the same `SK value`). But it doesn't have the `irreducibility` property, because we could discard the `CITY` `attribute` and what's left, the `set` {`SNO`}, would still have the `uniqueness` property. So we don't regard `SK` as a `key`, because it's "`too big.`" By contrast, {`SNO`} _`is`_ `irreducible`, and it's a `key`.

Why do we want `keys` to be `irreducible`? One reason is that if we were to specify a "`key`" that was _`not`_ `irreducible`, the `DBMS` wouldn't be able to enforce the `uniqueness constraint` properly. For example, suppose we lied and told the `DBMS` that {`SNO`,`CITY`} was a `key`. Then it couldn't enforce the `constraint` that supplier numbers are "`globally`" unique; instead, it could enforce only the weaker `constraint` that supplier numbers are "`locally`" unique, in the sense that they're unique within a given city. So this is one reason (not the only one) why we require `keys` not to include any `attributes` that aren't needed for unique identification purposes.

Now, all of the `relvars` we've seen so far have had just one `key`. Here, by contrast, are some with two or more (they're meant to be self-explanatory). Note the overlapping nature of the `keys` in the second and third examples.

```
VAR TAX_BRACKET BASE RELATION
  { LOW MONEY, HIGH MONEY, PERCENTAGE INTEGER }
    KEY { LOW }
    KEY { HIGH }
    KEY { PERCENTAGE } ;

VAR ROSTER BASE RELATION
  { DAY DAY_OF_WEEK, TIME TIME_OF_DAY, GATE GATE, PILOT NAME }
    KEY { DAY, TIME, GATE }
    KEY { DAY, TIME, PILOT } ;

VAR MARRIAGE BASE RELATION
  { SPOUSE_A NAME, SPOUSE_B NAME, DATE_OF_MARRIAGE DATE }
    /* assume no polygamy and no couple marrying */
    /* each other more than once ...             */
    KEY { SPOUSE_A, DATE_OF_MARRIAGE }
    KEY { DATE_OF_MARRIAGE, SPOUSE_B }
    KEY { SPOUSE_B, SPOUSE_A } ;
```

I'll close this section with a few miscellaneous points. First, note that the `key` concept applies to `relvars`, not `relations`. Why? Because to say something is a `key` is to say a certain `integrity constraint` is in effect—a certain `uniqueness constraint`, to be specific—and `integrity constraints` apply to `variables`, not `values`. (`Integrity constraints` constrain `updates`, and `updates` apply to `variables`, not `values`. See Chapter 6 for further discussion.)

Second, if _`R`_ is a `relvar`, then _`R`_ certainly does have at least one `key`. The reason is that every possible `value` of _`R`_ is a `relation` and therefore contains no duplicate `tuples`, by definition; at the very least, therefore, the combination of all of the `attributes` of _`R`_ certainly has the `uniqueness` property.[^1] Thus, either that combination also has the `irreducibility` property or there's some `proper subset` of that combination that does. Either way, there's _`something`_ that's both unique and irreducible.

Third, note that `key values` are _`tuples`_. In the case of `relvar` `S`, for example, with its sole `key` {`SNO`}, the `value` of that `key` for some specific `tuple`—say, that for supplier `S1`—is:

```
TUPLE { SNO SNO('S1') }
```

(Recall from Chapter 3 that every `subset` of a `tuple` is a `tuple` in turn.) Of course, in practice we would usually say, informally, that the `key value` in this example is just `S1`—or `SNO('S1')`, rather—but it really isn't.

Following on from the previous point: it should now be clear that the `key` concept, like so much else in the `relational model`, relies on the fundamental concept of _`tuple equality`_. That is, in order to enforce the `uniqueness constraint`, we need to be able to tell when two `key values` are equal, and that's precisely a matter of `tuple equality`—even when, as in the case of `relvar` `S`, the `tuples` in question are of `degree` one and "`look like`" simple `scalar values`.

My final point has to do with the notion of _`functional dependency`_. I don't want to get into a lot of detail regarding that concept here—I'll do that in Chapter 7—but you're probably familiar with it anyway; all I want to do here is call your attention to the following. Let _`K`_ be a `key` for `relvar` _`R`_, and let _`A`_ be any `attribute` of _`R`_. Then _`R`_ necessarily satisfies the `functional dependency`:

```
      K
      →
      A
```

To elaborate briefly: in general, the `functional dependency` _`K`_ → _`A`_ means that whenever two `tuples` of _`R`_ have the same `value` for _`K`_, they also have the same `value` for _`A`_. But if two `tuples` have the same `value` for _`K`_, where _`K`_ is a `key`, then by definition they're the very same `tuple`!—and so they _`must`_ have the same `value` for _`A`_. In other words, loosely: we always have "`functional dependency arrows`" out of `keys` to everything else in the `relvar`. Again, I'll revisit these ideas in Chapter 7.

## More on Foreign Keys

I explained the basic idea of `foreign keys` in Chapter 1, but here's a precise definition (note the reliance on `tuple equality` once again):

> _`Definition:`_ Let _`R1`_ and _`R2`_ be `relvars`, not necessarily distinct, and let _`K`_ be a `key` for _`R1`_. Let _`FK`_ be a `subset` of the `heading` of _`R2`_ that, possibly after some `attribute renaming`, involves exactly the same `attributes` as _`K`_. Then _`FK`_ is a _`foreign key`_ if and only if, at all times, every `tuple` in _`R2`_ has an _`FK`_ `value` that is equal to the _`K`_ `value` in some (necessarily unique) `tuple` in _`R1`_ at the time in question.

As we know, in the suppliers-and-parts `database`, {`SNO`} and {`PNO`} are `foreign keys` in `relvar` `SP`, referencing the sole `candidate key`—in fact, the `primary key`—in `relvar` `S` and `relvar` `P`, respectively. Here's another example:

```
VAR EMP BASE RELATION
  { ENO ENO, ..., MNO ENO, ... }
    KEY { ENO }
    FOREIGN KEY { RENAME ( MNO AS ENO ) } REFERENCES EMP ;
```

`Attribute` `MNO` here denotes the employee number of the manager of the employee identified by `ENO`; thus, the "`referencing relvar`" (_`R2`_ in the definition) and the "`referenced relvar`" (_`R1`_ in the definition) in this example are one and the same. For example, the `EMP tuple` for employee `E3` might include an `MNO value` of `E2`, which constitutes a `reference` to the `EMP tuple` for employee `E2`. But `foreign key values`, like `candidate key values`, are _`tuples`_; conceptually, therefore, we have to rename the `MNO` `attribute` in the `foreign key` specification, in order for the `tuple equality comparison` to be valid. (What `tuple equality comparison`? The one that's implicit in the process of checking the `foreign key constraint`—recall that `tuples` must certainly be of the same `type` if they're to be tested for equality, and "`same type`" means they must have the same `attribute names`.)

As an aside, I should mention that the `relational model` as originally formulated required `foreign keys` to match not just some `candidate key` but, very specifically, the _`primary`_ `key` in the referenced `relvar`. However, I gave my reasons in Chapter 1 for not insisting that some `candidate key` always be chosen and made `primary`; accordingly, therefore, I don't want to insist that `foreign keys` always match `primary keys` specifically. (I agree with `SQL` on this one.)

Now, `SQL` supports not just `foreign keys` as such but also certain associated _`referential actions`_ such as `CASCADE` (which can be specified as part of either an `ON DELETE` clause or an `ON UPDATE` clause). For example, the `CREATE TABLE` statement for shipments might include the following:

```
FOREIGN KEY ( SNO ) REFERENCES S ( SNO ) ON DELETE CASCADE
```

Given this specification, an attempt to delete a specific supplier will `cascade` to delete all shipments for that supplier as well. I mention this point for the following reasons:

- First, such specifications might be useful in practice, but they aren't part of the `relational model` as such.
- But that's not necessarily a problem! The `relational model` is the foundation of the `database` field, but it's _`only`_ the foundation. There's no reason why additional features shouldn't be built on top of, or alongside, that foundation—just so long as those additions don't violate the prescriptions of the model, of course (and are in the spirit of the model and can be shown to be useful, I suppose I should add). To elaborate:
  1. `Type theory` provides the most obvious example. We saw in Chapter 2 that "`types` are orthogonal to `tables`," but we also saw that full and proper `type support` in `relational systems` is highly desirable, to say the very least.
  2. By way of a second example, the `relational model` has almost nothing to say about `recovery` and `concurrency controls`, but this fact obviously doesn't mean that `relational systems` shouldn't provide such controls. (Actually it could be argued that the `relational model` does say something about such matters implicitly, because it relies on the `DBMS` to implement `updates` properly and not to lose data—but it doesn't prescribe anything specific.)

One final remark to close this section: I've discussed `foreign keys` because they're of considerable pragmatic importance, and also because they're part of the model as originally defined. But I think I should stress the point that they aren't truly fundamental—they're really just shorthand for certain `integrity constraints` that are commonly required in practice, as we'll see in Chapter 6.[^2] (In fact, much the same could be said for `candidate keys` as well, but in that case the practical benefits of providing a shorthand are overwhelming.)

## More on Views

A `view`[^3][^4], also called a `virtual relvar`, is a `relvar` that doesn't have separate existence in its own right but looks to the user as if it did. Here's a definition:

> _`Definition:`_ A _`view`_ or _`virtual relvar V`_ is a `relvar` whose `value` at time _`t`_ is the result of evaluating a certain `relational expression` at that time _`t`_. The `expression` in question is specified when _`V`_ is defined and must mention at least one `relvar`.

The following are a couple of examples, "`London suppliers`" and "`non-London suppliers`" (**`Tutorial D`** on the left, `SQL` on the right):

```
VAR LS VIRTUAL                    |  CREATE VIEW LS AS
( S WHERE CITY = 'London' ) ;     |  ( SELECT S.*
                                  |  FROM   S
                                  |  WHERE  S.CITY = 'London' ) ;

VAR NLS VIRTUAL                   |  CREATE VIEW NLS AS
( S WHERE CITY ≠ 'London' ) ;  |                  ( SELECT S.*
                        FROM   S    |
                                  |   WHERE  S.CITY <> 'London' ) ;
```

The parentheses in all of these examples are unnecessary but not wrong. I include them for clarity.

### View Retrievals

To repeat, `views` are meant to look to the user as if they had their own separate existence; in other words, they're supposed to "`look and feel`" just like `base relvars` so far as the user is concerned. In particular, the user should be able to operate on `views` as if they were `base relvars`, and the `DBMS` should be able to map those user `operations` into suitable `operations` on the `base relvars` in terms of which the `views` are ultimately defined. I say "`ultimately`" here because (of course) one thing we can do, if `views` really do behave just like `base relvars`, is define further `views` on top of them, as in this `SQL` example:

```
CREATE VIEW LS_STATUS
  AS ( SELECT LS.SNO, LS.STATUS
       FROM   LS ) ;
```

Mapping read-only `operations` is straightforward. For example, suppose we issue this `SQL query` on `view` `LS`:

```
SELECT LS.SNO
FROM   LS
WHERE  LS.STATUS > 10
```

First, the `DBMS` replaces the `reference` to the `view` in the `FROM` clause by the `expression` that defines that `view`, yielding:

```
SELECT LS.SNO
FROM ( SELECT S.*
       FROM   S
       WHERE  S.CITY = 'London' ) AS LS
WHERE  LS.STATUS > 10
```

This `expression` can now be simplified to:

```
SELECT S.SNO
FROM   S
WHERE  S.CITY = 'London'
AND    S.STATUS > 10
```

The reason the foregoing process works is precisely because of the _`closure`_ property of the `relational algebra`. `Closure` implies, among other things, that wherever we're allowed to have the _`name`_ of something—for example, in a `query`—we can always have a more general `expression` that evaluates to a `thing` of the appropriate type.[^5] In the `FROM` clause, for example, we can have an `SQL table name`; thus we can also have a more general `SQL table expression`, and that's why we're allowed to substitute the `expression` that defines the `view` `LS` for the name `LS` in the example.

By the way, it's worth mentioning that the foregoing process didn't always work in early versions of `SQL` (to be specific, in versions of the `SQL standard` prior to 1992), because those early versions failed to support `closure` properly. As a result, certain innocuous-looking `queries` against certain innocuous-looking `tables` (actually `views`) failed—and failed, moreover, in ways that were hard to explain. Here's a simple example:

```
CREATE VIEW V
  AS ( SELECT S.CITY, SUM ( S.STATUS ) AS ST
       FROM   S
       GROUP  BY S.CITY ) ;


SELECT V.CITY
FROM   V
WHERE  V.ST > 25
```

This example failed in the `SQL standard` prior to 1992. And although the `standard` has now been fixed, it doesn't follow that all of the products have! And indeed there's at least one major product that still hasn't, at the time of writing (early 2005).

### View Updates

I turn now to `update operations`. Before I get into specifics, I want to look at the London and non-London supplier `views` again (and now I'll switch to **`Tutorial D`**):

```
VAR LS  VIRTUAL ( S WHERE CITY = 'London' ) ;

VAR NLS VIRTUAL ( S WHERE CITY ≠ 'London' ) ;
```

The important point here is as follows: instead of `S` being the `base relvar` and `LS` and `NLS` `views`, _`LS and NLS could be base relvars and S could be a view`_, like this:

```
VAR LS BASE RELATION
  { SNO SNO, SNAME NAME, STATUS INTEGER, CITY CHAR }
    KEY { SNO } ;

VAR NLS BASE RELATION
  { SNO SNO, SNAME NAME, STATUS INTEGER, CITY CHAR }
    KEY { SNO } ;

VAR S VIRTUAL ( LS UNION NLS ) ;
```

> **Note**
>
> In order to achieve complete equivalence, we would also have to specify certain `constraints`—in particular, `constraints` to the effect that every `CITY value` in `LS` is London and every `CITY value` in `NLS` is _`not`_ London—but I omit such details here. See Chapter 6 for further discussion of such matters.

The message of this example is that, to a very large extent, _`which relvars are base and which virtual is arbitrary`_—from which it follows that there must be no arbitrary and unnecessary distinctions between `base` and `virtual relvars`. This state of affairs is referred to as _`The Principle of Interchangeability`_ (of `base` and `virtual relvars`). Here are some implications:

- Like `base relvars`, `views` are subject to `integrity constraints`. (We usually think of `integrity constraints` as applying just to `base relvars`, but _`The Principle of Interchangeability`_ shows that this position isn't really tenable.)
- In particular, `views` have `candidate keys` (and so I should perhaps have included some `key` specifications in my `view` examples prior to this point; **`Tutorial D`** permits such specifications, but `SQL` doesn't). They might also have `foreign keys`, and `foreign keys` might refer to them.
- I didn't mention this point in Chapter 1, but the "`entity integrity`" rule is supposed to apply specifically to `base relvars`, not `views`. It thereby violates _`The Principle of Interchangeability`_. (Of course, I reject that rule anyway, because it has to do with `nulls`.)
- Many `SQL products`, and the `SQL standard`, provide some kind of "`row ID`" feature. If that feature applies to `base tables` and not to `views`—which in practice is quite likely—it violates _`The Principle of Interchangeability`_.[^6] Of course, `row IDs` as such aren't part of the `relational model`, but that fact in itself doesn't mean they shouldn't be supported. But I observe as an important aside that if those `row IDs` are regarded as some kind of _`object`_ ID in the `object-oriented` sense (as they are, most unfortunately, in the `SQL standard`, as well as in most of the major `SQL products`), then they're definitely prohibited! `Object IDs` are effectively _`pointers`_, and the `relational model` explicitly prohibits `pointers`.

And, to revert to the main point of this discussion, we _`must`_ be able to update `views`—because if we can't, then that fact in itself constitutes the clearest possible violation of _`The Principle of Interchangeability`_.

As you probably know, `SQL`'s support for this requirement is quite weak, both in the `standard` and in the major commercial products. It does at least typically include support for `updates` on `views` defined as simple `restrictions` and/or `projections` of a single underlying `base relvar` (though even here there are some problems). For example, consider the following `view` (which is essentially identical to one we saw in Chapter 1):

```
CREATE VIEW SST_PARIS
  AS ( SELECT S.SNO, S.STATUS
       FROM   S
       WHERE  S.CITY = 'Paris' ) ;
```

This `view` is a `projection` of a `restriction` of `base table` `S`, and so we might, for example, be able to perform the following `DELETE` on it:

```
DELETE
FROM   SST_PARIS
WHERE  SST_PARIS.STATUS > 15 ;
```

This `DELETE` maps to:

```
DELETE
FROM   S
WHERE  S.CITY = 'Paris'
AND    S.STATUS > 15 ;
```

But few products provide support for updating `views` that are much more sophisticated than this one.

Unfortunately, I'm now straying into an area in which there's still a certain amount of controversy. My own opinion is that the `view updating` problem has largely been solved (that is, the theory exists); however, not everybody agrees with me, and in any case a detailed discussion of the subject requires rather more background than it's possible to include in a book of this nature. Thus, I'm afraid the best I can do here is refer you to another book—_Databases, Types, and the Relational Model: The Third Manifesto_, Third Edition (Addison-Wesley, 2006), by C. J. Date and Hugh Darwen, where the subject is examined in depth—if you want more specifics.

### Miscellaneous Points

There are a few more things I need to say in order to finish up this section. First of all, it's well known, but worth mentioning anyway, that `views` serve two rather different purposes:

- The user who actually defines `view` _`V`_ is, obviously, aware of the `expression` _`X`_ in terms of which _`V`_ is defined. That user can use the name _`V`_ wherever the `expression` _`X`_ is intended, but such uses are basically just shorthand.
- By contrast, a user who's merely informed that _`V`_ exists and is available for use is supposed (at least ideally) _`not`_ to be aware of the `expression` _`X;`_ to that user, in fact, _`V`_ is supposed to look and feel just like a `base relvar`, as we've already seen. And it's this second use of `views` that's the really important one, and the one I've been concentrating on, tacitly, throughout this section so far.

Second, when I explained what a `view` was at the beginning of this section, I said the `relational expression` that defined the `view` had to mention at least one `relvar`. Why? Because if it doesn't, the "`virtual relvar`" won't be a `relvar` at all!—I mean, it won't be a _`variable`_, and it certainly won't be updatable. Instead, it'll be a _`relation constant`_, or what we might call a "`relcon`." For example (to invent some syntax on the fly):

```
CONST PERIODIC_TABLE ( RELATION {
      TUPLE { ELEMENT 'Hydrogen', SYMBOL 'H' , ATOMICNO  1 },
      TUPLE { ELEMENT 'Helium'  , SYMBOL 'He', ATOMICNO  2 },
      ...
      TUPLE { ELEMENT 'Uranium' , SYMBOL 'U' , ATOMICNO 92 }
                                } ) ;
```

While it certainly might be desirable to provide some kind of "`relcon`" functionality along the foregoing lines, I don't think we should think of such things as `relvars`. I don't think it helps the cause of understanding to pretend that `constants` are `variables`.

Third, an unfortunate terminological clash is arising as I write, certainly in the academic world, and to some extent in the commercial world also. Recall from Chapter 1 that a `view` can be thought of as a `derived relvar`. Well, there's another kind of `derived relvar`, too, called a _`snapshot`_. As the name might suggest, a `snapshot`, although it's derived, is real, not virtual—meaning it's represented not just by its definition in terms of other `relvars` but also, at least conceptually, by its own separate copy of the data. For example (to invent some syntax again):

```
VAR LSS SNAPSHOT ( S WHERE CITY = 'London' )
    REFRESH EVERY DAY ;
```

Defining a `snapshot` is just like executing a `query`, except that:

- The result of the `query` is saved in the `database` under the specified name (`LSS` in the example) as a read-only `relvar` (read-only, that is, apart from the periodic refresh; see the next bullet item).
- Periodically (`EVERY DAY` in the example) the `snapshot` is refreshed—its current `value` is discarded, the `query` is executed again, and the result of that new execution becomes the new `snapshot value`.

In the example, therefore, `snapshot` `LSS` represents the data as it was at most 24 hours ago.

`Snapshots` are important in `data warehouses`, `distributed systems`, and many other contexts. In all cases, the rationale is that many applications can tolerate, or might even require, data "`as of `" some particular point in time. Reporting and accounting applications are a case in point; such applications typically require the data to be frozen at an appropriate moment (for example, at the end of an accounting period), and `snapshots` allow such freezing to occur without locking out other applications.

So far, so good. The problem is that `snapshots` have come to be known (at least in some circles) not as `snapshots` at all but as _`materialized views`_. But `snapshots` _`aren't`_ `views`! Indeed, the whole point about `views`, at least so far as the `relational model` is concerned, is that they _`aren't`_ materialized; as we've seen, `operations` on `views` are implemented by mapping them into suitable `operations` on the underlying `base relvars`. Thus, "`materialized view`" is simply a contradiction in terms. Worse yet, the unqualified term _`view`_ is now often taken to mean a "`materialized view`" specifically—again, at least in some circles—and so we're in danger of no longer having a good term to mean a `view` in the original sense. In this book, of course, I do use the term _`view`_ in its original sense, but be warned that it doesn't always have that meaning elsewhere. _`Caveat lector`_.

## Relvars and Predicates

Now we come to what in many ways is the most important part of this chapter. The essence of it is this: there's another way to think about `relvars`. I mean, most people think of `relvars` as if they were just files in the traditional computing sense—rather abstract files, perhaps (maybe _`disciplined`_ would be a better word than abstract), but files nonetheless. But there's a different way to look at them, a way that I believe can lead to a much deeper understanding of what's really going on. It goes like this.

Consider the suppliers `relvar` `S`. Like all `relvars`, that `relvar` is supposed to represent some portion of the real world. In fact, I can be more precise: the `heading` of that `relvar` represents a certain _`predicate`_, meaning it's a kind of generic statement about some portion of the real world (it's generic because it's _`parameterized`_, as I'll explain in a moment). The `predicate` in question looks like this:

> Supplier `SNO` is under contract, is named `SNAME`, has status `STATUS`, and is located in city `CITY`.

This `predicate` is the _`intended interpretation`_—in other words, the _`meaning`_, also called the _`intension`_ (note the spelling)—for `relvar` `S`.

You can think of a `predicate` as a _`truth-valued function`_. Like all functions, it has a `set` of parameters, it returns a result when it's invoked, and (because it's truth-valued) that result is either `TRUE` or `FALSE`. In the case of the `predicate` just shown, for example, the parameters are `SNO`, `SNAME`, `STATUS`, and `CITY` (corresponding to the `attributes` of the `relvar`, of course), and they stand for `values` of the applicable `types` (`SNO`, `NAME`, `INTEGER`, and `CHAR`, respectively). When we invoke the function—when we _`instantiate the predicate`_, as the logicians say—we substitute `arguments` for the parameters. Suppose we substitute the `arguments` `S1`, `Smith`, `20`, and `London`, respectively. Then we obtain the following _`proposition:`_

> Supplier `S1` is under contract, is named `Smith`, has status `20`, and is located in city `London`.

In general, a `proposition` in logic is a statement that's unconditionally either true or false. Here are a couple of examples:

> Edward Abbey wrote _The Monkey Wrench Gang_.

> William Shakespeare wrote _The Monkey Wrench Gang_.

The first of these is true and the second false. Don't fall into the common trap of thinking `propositions` must always be true ones! However, the ones I'm talking about in connection with `relvars` _`are`_ supposed to be true ones specifically, as I now explain:

- First, _`every`_ `relvar` has an associated `predicate`, called the _`relvar predicate`_ for the `relvar` in question.
- Let `relvar` _`R`_ have `predicate` _`P`_. Then every `tuple` _`t`_ appearing in _`R`_ at some given time can be regarded as representing a certain `proposition` _`p`_, derived by invoking (or instantiating) _`P`_ at that time with the `attribute values` from _`t`_ as `arguments`.
- And (very important!) we assume by convention that each `proposition` _`p`_ that's obtained in this manner evaluates to `TRUE`.

Hence, given our usual sample `value` for `relvar` `S`, we assume the following `propositions` all evaluate to `TRUE`:

> Supplier `S1` is under contract, is named `Smith`, has status `20`, and is located in city `London`.

> Supplier `S2` is under contract, is named `Jones`, has status `10`, and is located in city `Paris`.

> Supplier `S3` is under contract, is named `Blake`, has status `30`, and is located in city `Paris`.

And so on. What's more, we go further: if a certain `tuple` plausibly could appear in some `relvar` at some time but in fact doesn't, then we assume the corresponding `proposition` is false at that time (in other words, we adopt what's called the _`Closed World Assumption`_). For example, the `tuple`:

```
TUPLE { SNO SNO('S6'), SNAME NAME('Lopez'),
                       STATUS 30, CITY 'Madrid' }
```

is—let's agree—a plausible supplier `tuple` but doesn't appear in `relvar` `S` at this time, and so we assume _`it's not the case that`_ the following `proposition` is true at this time:

> Supplier `S6` is under contract, is named `Lopez`, has status `30`, and is located in city `Madrid`.

In other words, a given `relvar` contains, at any given time, _`all`_ and _`only`_ the `tuples` that represent true `propositions` (true instantiations of the `predicate`) at that time.

> _`More terminology:`_ Again, let _`P`_ be the `relvar predicate` or `intension` for `relvar` _`R`_, and let the `value` of _`R`_ at some given time be `relation` _`r`_. Then _`r`_—or the `body` of _`r`_, to be more precise—constitutes the _`extension`_ of _`P`_ at that time. Note, therefore, that the `extension` varies over time, but the `intension` does not.

### Relational Expressions

The ideas I've been discussing in this section all extend in a natural way to apply to arbitrary `relational expressions`. For example, consider this `expression`, which represents the `projection` of suppliers on all `attributes` but `CITY`:

```
S { SNO, SNAME, STATUS }
```

The result contains all `tuples` of the form:

```
TUPLE { SNO s, SNAME n, STATUS t }
```

such that a `tuple` of the form:

```
TUPLE { SNO s, SNAME n, STATUS t, CITY c }
```

currently appears in `S` for some `CITY value` _`c`_. In other words, the result represents the current `extension` of a `predicate` that looks like this:

> There exists some city `CITY` such that supplier `SNO` is under contract, is named `SNAME`, has status `STATUS`, and is located in city `CITY`.

Observe that this `predicate` has just three parameters and the corresponding `relation` (the `projection` of suppliers on all but `CITY`) has just three `attributes`—`CITY` is _`not`_ a parameter but what the logicians instead call a _`bound variable`_, owing to the fact that it's "`quantified`" by the phrase _`there exists some city`_. (See Appendix A for further explanation of `bound variables` and `quantifiers`.) A possibly clearer way of making the same point—that the `predicate` has just three parameters, not four—is to observe that the `predicate` in question is logically equivalent to this one:

> Supplier `SNO` is under contract, is named `SNAME`, has status `STATUS`, and is located in some city (_`in other words, somewhere, but we don't know where`_).

It follows from all of the above that `views` in particular represent certain `predicates`. For example, if `view` `SST` is defined as follows:

```
VAR SST VIRTUAL ( S { SNO, SNAME, STATUS } ) ;
```

then the `relvar predicate` for `SST` is precisely:

> Supplier `SNO` is under contract, is named `SNAME`, has status `STATUS`, and is located in some city.

There's one last point I want to make here about `predicates` and `propositions`. I've said a `predicate` has a `set` of parameters. As usual, however, that `set` might be empty—and if it is, the `predicate` becomes a `proposition`! (Certainly it's a statement that's unconditionally either true or false.) In other words, a `proposition` is a _`degenerate`_ `predicate`; all `propositions` are `predicates`, but most `predicates` aren't `propositions`.

## More on Relations Versus Types

Chapter 2 was _`called Relations Versus types`_. However, I wasn't in a position in that chapter to explain the most important difference between those two concepts—but now I am, and I will.

I've shown that the `database` at any given time can be thought of as a collection of true `propositions`: for example, the `proposition` _`Supplier S1 is under contract, is named Smith, has status 20, and is located in city London`_. More specifically, I've shown that the `argument values` appearing in such a `proposition` (`S1`, `Smith`, `20`, and `London`, in the example) are, precisely, the `attribute values` from the corresponding `tuple`, and of course each such `attribute value` is a `value` of the associated `type`. It follows that:

> **Types are sets of things we can talk about;**

> **relations are (true) statements about those things**.

In other words, `types` give us our vocabulary—the things we can talk about—and `relations` give us the ability to say things about the things we can talk about. (There's a nice analogy here that might help: _`Types are to relations as nouns are to sentences`_.) For example, if we limit our attention to suppliers only, for simplicity, we see that:

- The things we can talk about are supplier numbers, names, integers, and character strings—and nothing else.
- The things we can say are things of the form "`The supplier with the specified supplier number is under contract, has the specified name, has the status denoted by the specified integer, and is located in the city denoted by the specified character string`"—and nothing else. (Nothing else, that is, except for things that are _`logically implied`_ by things we can say. For example, given the things we already know we can say about supplier `S1`, we can also say things like _`Supplier S1 is under contract, is named Smith, has status 20, and is located in some city`_—where the city is left unspecified. And if you're thinking that what I've just told you is very reminiscent of, and probably has some deep connection to, relational `projection`… well, you'd be absolutely right.)

The foregoing state of affairs has at least three important corollaries. To be specific, in order to represent "`some portion of the real world`" (as I put it in the previous section):

1. `Types` and `relations` are both _`necessary`_—without `types`, we have nothing to talk about; without `relations`, we can't say anything.
2. `Types` and `relations` taken together are _`sufficient`_, as well as necessary—we don't need anything else, logically speaking. (Well, we do need `relvars`, in order to reflect the fact that the real world changes over time, but we don't need them to represent the situation at any given time.)
3. `Types` and `relations` _`aren't the same thing`_. Beware of anyone who tries to pretend they are! In fact, pretending a `type` is just a special kind of `relation` is precisely what certain commercial products try to do (though they don't usually talk in such terms)—and I hope it's clear that any product that's founded on such a logical error is doomed to eventual failure. The products I have in mind aren't `relational products`, of course; typically, they're products that support `objects` in the `object-oriented` sense, or products that try somehow to marry such `objects` and `SQL tables`. (In fact, at least one of the products I have in mind has indeed already failed.) Further details are beyond the scope of this book, however.

I'd like to wind up this section by offering a slightly more formal perspective on some of what I've been saying. I've said a `database` can be thought of as a collection of true `propositions`. In fact, a `database`, together with the `operators` that apply to the `propositions` represented in that `database` (or to `sets` of such `propositions`, rather), is _`a logical system`_. And when I say "`a logical system`," I mean a formal system—like euclidean geometry, for example—that has _`axioms`_ ("`given truths`") and _`rules of inference`_ by which we can prove _`theorems`_ ("`derived truths`") from those `axioms`. Indeed, it was Codd's very great insight, when he first invented the `relational model` back in 1969, that (despite the name) a `database` isn't really just a collection of _`data;`_ rather, it's a collection of _`facts`_, or in other words true `propositions`. Those `propositions`—the given ones, that is, which is to say the ones represented by the `base relvars`—are the `axioms` of the logical system under discussion. The `inference rules` are essentially the rules by which new `propositions` can be derived from the given ones; in other words, they're the rules that tell us how to apply the `operators` of the `relational algebra`. Thus, when the system evaluates some `relational expression` (in particular, when it responds to some `query`), it's really deriving new truths from given ones; in effect, it's proving a theorem!

Once we understand the foregoing, we can see that the whole apparatus of formal logic becomes available for use in attacking "`the database problem`." In other words, questions such as:

- What should the `database` look like to the user?
- What should `integrity constraints` look like?
- What should the `query language` look like?
- How can we best implement `queries`?
- More generally, how can we best evaluate `database expressions`?
- How should results be presented to the user?
- How should we design the `database` in the first place?

(and others like them) all become, in effect, questions in logic that are susceptible to logical treatment and can be given logical answers.

Of course, it goes without saying that the `relational model` supports the foregoing perception very directly—which is why, in my opinion, that model is rock solid, and "`right,`" and will endure. It's also why, again in my opinion, other "`data models`" are simply not in the same ballpark. Indeed, I seriously question whether those other "`models`" deserve to be called models at all, in the same sense that the `relational model` can be called a model. Certainly most of them are ad hoc to a degree, instead of being firmly founded, as the `relational model` is, in set theory and predicate logic. I'll expand on these issues in Chapter 8.

## Summary

The most important part of this chapter is the section having to do with `predicates` (along with the subsequent section, which discusses the related issue of `relations` versus `types`). Basically, every `relvar` _`R`_ has an associated `predicate` _`P`_ (the _`relvar predicate`_ for _`R`_); _`P`_ is the _`intended interpretation`_ or _`intension`_ for _`R`_, and it doesn't change over time. And if the current `value` of _`R`_ is `relation` _`r`_, then _`r`_ represents the _`current extension`_ of _`P`_; it consists of a `set` of `tuples`, each of which represents a true `proposition`, or in other words a true instantiation of _`P`_. The `extension` does change over time. Thus, a `database` together with its `operators` can be seen as a _`logical system`_.

Here are some other important points from the body of the chapter:

- Only `relvars` are updatable; talk of "`updating a tuple`" or "`updating an attribute`" is convenient but sloppy. `Updating` is always `set-at-a-time`.
- Every `relvar` has at least one (`candidate`) `key`. `Keys` have the properties of `uniqueness` and `irreducibility`. `Key values` are `tuples`.
- Some `relvars` have `foreign keys`. `SQL` supports certain associated "`referential actions`," such as `CASCADE`; such actions might well be useful in practice, but they aren't part of the `relational model`. What's more, `foreign keys` themselves aren't truly fundamental, either.
- `Operations` on `views` are implemented by mapping them into appropriate `operations` on the underlying `base relvars`. (The mapping process, which basically works because of `closure`, is straightforward for read-only `operations` but less so for `update operations`.) _`The Principle of Interchangeability`_ states that there must be no arbitrary and unnecessary distinctions between `base` and `virtual relvars`.
- "`Types are to relations as nouns are to sentences.`"
- `Types` and `relations` are both necessary and sufficient to represent any data we like. (At the logical level, that is; of course, other constructs are useful at the physical level, as we all know, but that's because the objectives are different at that level. The physical level is deliberately beyond the purview of the `relational model`.)

## Exercises

### Exercise 4-1

Explain in your own words why remarks like (for example) "`This UPDATE operation updates the status for suppliers in London`" aren't very precise. Give a replacement for that remark that's as precise as you can make it.

### Exercise 4-2

Why are `SQL`'s "`positioned update`" `operations` a bad idea?

### Exercise 4-3

Give definitions for `SQL` analogs of the `TAX_BRACKET`, `ROSTER`, and `MARRIAGE` `relvars` from the section "`More on Candidate Keys.`"

### Exercise 4-4

Why doesn't it make much sense to say a `relation` has a `key`?

### Exercise 4-5

In the body of the chapter, I gave one reason why `key irreducibility` is a good idea. Can you think of any others?

### Exercise 4-6

"`Key values are not scalars but tuples.`" Explain this remark.

### Exercise 4-7

Let `relvar` _`R`_ be of degree _`n`_. What's the maximum number of `keys` _`R`_ can have?

### Exercise 4-8

`Relvar` `EMP` from the section "`More on Foreign Keys`" is an example of what's sometimes called a _`self-referencing`_ `relvar`. Invent some sample data for that `relvar`. Does this example lead inevitably to a requirement for `null` support? (_`Answer:`_ No, but it does serve to show how seductive the `nulls` idea can be.) What can be done in this example if `nulls` are prohibited?

### Exercise 4-9

`SQL` has nothing analogous to **`Tutorial D`**'s renaming option in its `foreign key` specifications. Why not?

### Exercise 4-10

Can you think of a situation in which two `relvars` _`R1`_ and _`R2`_ might each have a `foreign key` referencing the other?

### Exercise 4-11

Investigate any `SQL product` available to you. What `referential actions` does that product support? Which ones do you think are useful? Can you think of any others that the product doesn't support but might be useful?

### Exercise 4-12

The `relational model` has nothing to say about `triggered procedures` (often known simply as _`triggers`_). Is this omission a problem? If so, why? If not, why not? Do you think `triggered procedures` are necessary? Or desirable?

### Exercise 4-13

Let `view` `LSSP` be defined as follows (`SQL`):

```
CREATE VIEW LSSP
  AS ( SELECT S.SNO, S.SNAME, S.STATUS, SP.PNO, SP.QTY
       FROM   S, SP
       WHERE  S.SNO = SP.SNO
       AND    S.CITY = 'London' ) ;
```

Here's a `query` on this `view`:

```
SELECT DISTINCT LSSP.STATUS, LSSP.QTY
FROM   LSSP
WHERE  LSSP.PNO IN
     ( SELECT P.PNO
       FROM   P
       WHERE  P.CITY <> 'London' )
```

What might the `query` that's actually executed on the underlying `base relvars` look like?

### Exercise 4-14

What `key(s)` does `view` `LSSP` from the previous exercise have?

### Exercise 4-15

Investigate any `SQL product` available to you. Are there any apparently legitimate `queries` on `views` that fail in that product? If so, state as precisely as you can which ones they are. What justification does the vendor offer for failing to provide full support? (Note that this exercise asks about `queries` only, not `updates`.)

### Exercise 4-16

Investigate any `SQL product` available to you. What `view updates` does that product support? Be as precise as you can in your answer.

### Exercise 4-17

Using either the suppliers-and-parts `database` or any `database` you happen to be familiar with, give some further examples to illustrate the point that which `relvars` are `base` and which `virtual` is largely arbitrary.

### Exercise 4-18

Investigate any `SQL product` available to you. In what ways—there will be some!—does that product violate _`The Principle of Interchangeability?`_

### Exercise 4-19

Distinguish between `views` and `snapshots`. Does `SQL` support `snapshots`? Does any product that you're aware of?

### Exercise 4-20

What's a "`materialized view`"? Why is the term deprecated?

### Exercise 4-21

Define the terms _`proposition`_ and _`predicate`_. Give examples.

### Exercise 4-22

State the `predicates` for `relvars` `P` and `SP` from the suppliers-and-parts `database`.

### Exercise 4-23

What do you understand by the terms _`intension`_ and _`extension?`_

### Exercise 4-24

Let _`DB`_ be any `database` you happen to be familiar with and let _`R`_ be any `relvar` in _`DB`_. What's the `predicate` for _`R`_? _`Note:`_ The point of this exercise is to get you to apply the fundamental ideas discussed in the body of this chapter to your own data, in an attempt to get you thinking about data in general in such terms. Obviously the exercise has no unique right answer.

### Exercise 4-25

Consider `views` `LS` and `NLS` from the section "`More on Views.`" What are the corresponding `relvar predicates`? Would it make any difference if they weren't `views` but `base relvars` instead?

### Exercise 4-26

What's the `predicate` for `view` `LSSP` from Exercise 4-13?

### Exercise 4-27

Explain the _`Closed World Assumption`_.

### Exercise 4-28

A `key` is a `set` of `attributes`, and the empty set is a legitimate set; thus, we could define an _`empty key`_ to be a `key` where the `set` of `attributes` is empty. Can you think of any uses for such a `key`?

### Exercise 4-29

What's the `predicate` for a `relvar` of degree zero? (Does this question even make sense? Justify your answer.)

### Exercise 4-30

Every `relvar` has some `relation` as its `value`. Is the converse true? That is, is every `relation` a `value` of some `relvar`?

---

[^1]: We can't say the same for `SQL tables`, of course—`SQL tables` allow duplicate `rows` and so might have no `key` at all.

[^2]: Precisely for this reason, in fact, explicit support for them is currently omitted from **`Tutorial D`**. However, I'm sure an "`industrial-strength`" version of that language would support them, and I'm taking the liberty in this book of pretending such support is already there.

[^3]: I would much have preferred to use the more formal term _`object`_ in this sentence in place of the very vague term _`thing`_, but _`object`_ has become a loaded term in computing contexts.

[^4]: It might violate _`The Information Principle`_, too (see Chapter 8).

[^5]:
    I'd like to suggest, politely, that (a) those who are "`shocked at the thought`" probably know the implementations well, not `SQL`, and (b) their shock is probably due to their recognition that those implementations do such a poor job of optimizing away unnecessary `DISTINCTs`. If I write `SELECT DISTINCT S.SNO FROM S ...`, that `DISTINCT` can safely be ignored. If I write `EXISTS (SELECT DISTINCT ...)` or `IN (SELECT DISTINCT ...)`, that `DISTINCT` can safely be ignored. If I write `SELECT DISTINCT SP.SNO FROM SP ... GROUP BY SP.SNO`, that `DISTINCT` can safely be ignored. If I write `SELECT DISTINCT ... UNION SELECT DISTINCT ...`, those `DISTINCTs` can safely be ignored. And so on. Why should I, as a user, have to devote time and effort to figuring out whether some `DISTINCT` is going to be a performance hit and whether it's logically safe to omit it, and to remembering all of the details of `SQL`'s inconsistent rules for when duplicates are automatically eliminated and when they're not? Well, I could go on. However, I decided- against my own better judgment, but in the interests of maintaining good relations (with myreviewers, I mean)-not to follow myown advice in the remainder of this book but only to request duplicate elimination explicitly whenit seemedlogically necessary to doso. It wasn't always easy to decide when that was, either. But at least now I can add my voice to those complaining to the vendors, I suppose.
    [^6]: It might violate _`The Information Principle`_, too (see Chapter 8).

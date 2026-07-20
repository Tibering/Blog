# Preface

**After many years working in the `database` community in various capacities**, I've come to realize there's a real need for a book for practitioners (not novices) that explains the basic principles of `relational theory` in a way not tainted by the quirks and peculiarities of existing products, commercial practice, or the `SQL` standard. I wrote this book to fill that need. My intended audience is thus experienced `database` practitioners or other `database` professionals who are honest enough to admit they don't understand the theory underlying their own field as well as they might, or should. That theory is, of course, the `relational model`—and while it's true that the fundamental ideas of that theory are all quite simple, it's also true that they're widely misrepresented, or underappreciated, or both. Often, in fact, they don't seem to be understood at all. For example, here are a few `relational` questions. How many of them can you answer?

1. What exactly is `first normal form`?
2. What's the connection between `relations` and `predicates`?
3. What's `semantic optimization`?
4. What's a `join dependency`?
5. Why is `semidifference` important?
6. Why doesn't `deferred integrity checking` make sense?
7. What's a `relation variable`?
8. What's `nonloss decomposition`?
9. Can a `relation` have an `attribute` whose values are `relations`?
10. What's the difference between `SQL` and the `relational model`?
11. Why is _`The Information Principle`_ important?
12. How does `XML` fit with the `relational model`?

This book provides answers to these and many related questions. Overall, it's meant to help `database` practitioners understand `relational theory` in depth and make good use of that understanding in their professional day-to-day activities.

## What Makes This Book Different?

I must immediately explain that very little of the technical substance of this book is new. I've said most of it before, in previous books and other publications—I've just looked around and seen that it needs to be said again. But I've tried to say it _differently_ this time: the sequence is different, the development is different, the style and treatment are different, and the intended audience is different (more on this last point in a moment). So while parts of the material have appeared before in some form or another in a variety of places, I do regard this as a totally new book. Of course, some portions of the text are, inevitably, similar to things I've written elsewhere, because the material all comes out of the same place, as it were: namely, my own brain, and my experience in teaching this material in live seminars over many years. But there's no direct plagiarism; direct plagiarism wouldn't serve my purpose. However, I _have_ consciously reused many of my old examples, because those examples have been very carefully tailored over the years to illustrate exactly the points I want to make, no more and no less.

Let me come back to that point about the intended audience for this book being different. As already indicated, I've published several previous books in the field of `database` technology. So how is this one different? In particular, does it compete with any of those existing books?

In my view, the answer to the latter question is _no_. I have two books from Addison-Wesley that might look at first sight as if they could be competitors to this one:

- _An Introduction to Database Systems_, Eighth Edition (2004)
- _Databases, Types, and the Relational Model: The Third Manifesto_, Third Edition (coauthored with Hugh Darwen, to appear 2006)

However, the first of these, though I call it an "introduction," actually covers the whole of the `database` field, not just the `relational model`. It's meant primarily as a college text, and it doesn't assume any prior `database` knowledge or experience on the part of its readers; also, the style is much more formal than that of the present book, as befits a textbook.

The second is an extensive reworking of an earlier book by Hugh Darwen and myself called _Foundation for Future Database Systems: The Third Manifesto_, Second Edition (Addison-Wesley, 2000). This one is an advanced (graduate-level?) text, and it's even more formal—not to say terse—than the first book. Although there's obviously some overlap in subject matter, therefore, I don't really see any of these three books as competing with the other two.

Another significant point of difference is that the present book is mainly meant for self-study (though there are portions you might want to discuss with your friends and colleagues and coworkers). There are exercises, too, to help reinforce the material; there's no obligation to do those exercises, of course, but I think it's a good idea to have a go at some of them at least. Answers, often giving more information about the subject at hand, can be found online at [http://oreilly.com/catalog/databaseid](http://oreilly.com/catalog/databaseid).

While I'm on the topic of possible competition, I should mention a couple of other books of mine (the first from Addison-Wesley again, the other from Morgan Kaufmann):

- _The Database Relational Model: A Retrospective Review and Analysis_ (2001)
- _Temporal Data and the Relational Model_ (coauthored with Hugh Darwen and Nikos A. Lorentzos, 2003)

In my opinion, the first of these complements the present book, in that it reviews and analyzes, in a fairly informal style, the series of papers by Ted Codd that first introduced the `relational model` to the world at large. And the second is concerned, as its title indicates, not with `relational theory` as such but with a specific application of that theory. While the first chapter of that book does contain an overview of the `relational model` and thus _might_ be considered to compete slightly with the present book, I don't really think it does.

The net of all of the above is this: although I've written on most of these topics before in a variety of places, and sometimes in unavoidably similar terms, I don't think any other publication by myself—or anyone else, so far as I know—brings them together and covers them in a way that's even close to the way the present book does.

## Further Preliminaries

I need to take care of several further preliminaries. As I've already said, I'll be using some of the same examples here as in other books and articles of mine; in particular, the running example is the famous (or infamous) `suppliers-and-parts database`. I apologize for dragging this old warhorse out yet one more time, but the remark I made earlier about examples having been very carefully designed to illustrate exactly the points I want to make applies to this particular example in spades.

Second, my own understanding of the `relational model` has evolved over the years, and continues to do so. This book represents my very latest thinking on the subject; thus, if you detect any discrepancies between this book and the ones already mentioned (and there are a few), the treatment in this book should be taken as superseding that in those earlier ones. Though I hasten to add that such discrepancies are mostly of a fairly minor nature; what's more, I've taken care always to relate new terms and concepts to earlier ones, whenever I felt it was necessary to do so.

Third, I am, of course, going to talk about theory—but it's an article of faith with me that _theory is practical_. I mention this point explicitly because so many people seem to believe the exact opposite: namely, that if something's theoretical, it can't be practical. But the truth is that theory—at least, the theory I'm talking about here, which is `relational theory`, of course—is most definitely very practical indeed. The purpose of that theory is _not_ just theory for its own sake; the purpose of that theory is to allow us to build systems that are 100 percent practical. Every detail of the theory is there for solid practical reasons. Indeed, much of that theory is not only practical, it's fundamental, straightforward, simple, useful, and it can be _fun_ (as I hope to demonstrate in the course of this book).

(In fact, we really don't have to look any further than the `relational model` itself to find the most striking possible illustration of the foregoing thesis. Indeed, it really shouldn't be necessary to defend the notion that theory is practical, in a context such as ours: namely, a multibillion dollar industry totally founded on one great theoretical idea. But I suppose the cynic's position would be "Yes, but what has theory done for me lately?" In other words, those of us who do think theory is important must continually justify ourselves to our critics—which is another reason why I think a book like this one is needed.)

And another point: the standard "relational" language is `SQL`, of course, and I assume you're reasonably familiar with that language, as well as with basic `database` concepts in general. As you'll soon see, however, I'm pretty critical of `SQL` in what follows. The sad fact is that `SQL` fails in all too many ways to support the `relational model` properly; it suffers from numerous sins of both omission and commission (which is why I said it was "relational," in quotation marks, when I first mentioned it). But this state of affairs is precisely one of the reasons why you need to know the `relational model`! Because `SQL`'s support for the model is so deficient, it gives you rope to hang yourself; so you need to know the theory in order _not_ to hang yourself—that is, you need to know the theory in order to enforce for yourself the various disciplines that `SQL` really ought to enforce on your behalf but doesn't. A good example is duplicate rows: `SQL` allows duplicate rows, but the `relational model` doesn't. So you need to know _why_ the model doesn't allow them in order to understand why it's important not to "take advantage" of this particular `SQL` "feature." As one reviewer of my original proposal for this book, Stephane Faroult, wrote: "When you have a bit of practice, you realize there's no way to avoid having to know the theory."

Talking of `SQL`, by the way, please note that I use the term _`SQL`_ throughout the book to mean the standard version of that language exclusively, not some product-specific dialect (barring explicit statements to the contrary, of course). In particular, I follow the standard in pronouncing the name "ess cue ell," not "sequel" (though this latter pronunciation is common in the field), and therefore say things like _an_ `SQL` table, not _a_ `SQL` table.

Finally, I'd like to mention that a live one-day seminar is available based on the material in this book. See [http://www.dbdebunk.com](http://www.dbdebunk.com) or [http://www.thethirdmanifesto.com](http://www.thethirdmanifesto.com) for further details.

## Conventions Used in This Book

The following typographical conventions are used in this book:

- **_Italic_**  
  Used for emphasis and indicates new terms. Italic also indicates when a variable, such as _x_, is used in place of something else during a discussion in the main text of the book.

- **`Constant width`**  
  Used for code examples.

- **_`Constant width italic`_**  
  Marks the occurrence of a variable or user-supplied element in a code example.

## Using Code Examples

This book is here to help you get your job done. In general, you may use the code in this book in your programs and documentation. You do not need to contact us for permission unless you're reproducing a significant portion of the code. For example, writing a program that uses several chunks of code from this book does not require permission. Selling or distributing a CD-ROM of examples from O'Reilly books _does_ require permission. Answering a question by citing this book and quoting example code does not require permission. Incorporating a significant amount of example code from this book into your product's documentation _does_ require permission.

We appreciate, but do not require, attribution. An attribution usually includes the title, author, publisher, and ISBN. For example: "_Database in Depth: Relational Theory for Practitioners_, by C. J. Date. Copyright 2005 O'Reilly Media, Inc., 0-596-10012-4."

If you feel your use of code examples falls outside fair use or the permission given above, feel free to contact us at [permissions@oreilly.com](mailto:permissions@oreilly.com).

## Safari Enabled

![image with no caption](httpatomoreillycomsourceoreillyimages34671.png)

When you see a Safari® enabled icon on the cover of your favorite technology book, that means the book is available online through the O'Reilly Network Safari Bookshelf.

Safari offers a solution that's better than e-Books. It's a virtual library that lets you easily search thousands of top tech books, cut and paste code samples, download chapters, and find quick answers when you need the most accurate, current information. Try it free at [http://safari.oreilly.com](http://safari.oreilly.com).

## Comments and Questions

We've done our best to make this book as error-free as we can, but you might find mistakes. If so, please notify us by writing to:

| O'Reilly Media, Inc.                            |
| ----------------------------------------------- |
| 1005 Gravenstein Highway North                  |
| Sebastopol, CA 95472                            |
| (800) 998-9938 (in the United States or Canada) |
| (707) 829-0515 (international or local)         |
| (707) 829-0104 (FAX)                            |

You can also send messages electronically. To be put on the mailing list or request a catalog, send email to:

| [info@oreilly.com](mailto:info@oreilly.com) |
| ------------------------------------------- |

To ask technical questions or comment on the book, send email to:

| [bookquestions@oreilly.com](mailto:bookquestions@oreilly.com) |
| ------------------------------------------------------------- |

We have a web site for this book, where you can find examples and errata (previously reported errors and corrections are available for public view there). You can access this page at:

| [http://www.oreilly.com/catalog/databaseid](http://www.oreilly.com/catalog/databaseid) |
| -------------------------------------------------------------------------------------- |

For more information about this book and others, see the O'Reilly web site:

| [http://www.oreilly.com](http://www.oreilly.com) |
| ------------------------------------------------ |

## Acknowledgments

It's a pleasure to acknowledge my debt to the many people involved, directly or indirectly, in the production of this book. In particular, I'd like to mention my reviewers Stephane Faroult, Jonathan Gennick, Lex de Haan, Anthony Molinaro, Peter Robson, and Michael Wener for their helpful comments on earlier drafts of the manuscript. I'd also like to thank Nagraj Alur and Hugh Darwen for various technical discussions. Next, I'd like to thank my wife Lindy (as always) for her support throughout this and all of my other `database` projects over the years. Finally, I'm grateful to everyone at O'Reilly—especially Jonathan Gennick and Genevieve d'Entremont—for their encouragement, contributions, and support throughout the production of this book.

—C. J. Date, Healdsburg, California, 2005

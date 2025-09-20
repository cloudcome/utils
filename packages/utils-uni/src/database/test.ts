import { dbMutate, dbQuery } from './command';
import { dbProxy } from './proxy';
import { dbTransaction } from './transaction';
import { dbUpsert } from './upsert';

type UserSex = 'male' | 'female';
type User = {
  _id: string;
  nickname: string;
  age: number;
  sex: UserSex;
};
type UserProfile = {
  _id: string;
  userId: string;
  avatar: string;
  bio: string;
};
type Post = {
  _id: string;
  title: string;
  content: string;
  authorId: string;
  tagId: string[];
};
type Tag = {
  _id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};
type Comment = {
  _id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  likes: number;
};
type Book = {
  _id: string;
  title: string;
  authorId: string;
  publishedAt: number;
};
type UserBook = {
  _id: string;
  readerId: string;
  bookId: string;
  createdAt: number;
  updatedAt: number;
};

const user1 = await dbProxy<User>('users')
  .select({
    age: true,
    sex: true,
  })
  .queryOne();
user1.age.toFixed();
user1.sex.toLowerCase();
assertType<{
  _id: string;
  age: number;
  sex: 'male' | 'female';
}>(user1);

const userTable = dbProxy<User>('user');
const userProfile = dbProxy<UserProfile>('profile');
const postTable = dbProxy<Post>('posts');
const tagTable = dbProxy<Tag>('tag');
const commentTable = dbProxy<Comment>('comment');
const bookTable = dbProxy<Book>('book');
const userBookTable = dbProxy<UserBook>('userBook');

const user2 = await userTable
  .whereId('123')
  .select({
    _id: true,
    // name: undefined,
    // name: true,
    // age: true,
    // sex: true,
    // aaa: 'true',
    // bbb: true,
    // ccc: false,
    // ddd: undefined,
  })
  .queryOne();
user2._id.charAt(0);
// user2.name.charAt(0);
// user2.age.toFixed();
// user2.sex.charAt(0);
// user2.def
assertType<{
  _id: string;
  // name: string;
  // age: number;
  // sex: UserSex;
}>(user2);

const user = await userTable
  .lookup(
    postTable
      .select({ title: true })
      .lookup(
        commentTable.select({
          content: true,
          likes: true,
        }),
        {
          as: 'comments',
          type: '1:n',
          localField: '_id',
          foreignField: 'postId',
        },
      )
      .lookup(
        tagTable.select({
          name: true,
          createdAt: true,
        }),
        {
          as: 'tags',
          type: 'n:1',
          localField: 'tagId',
          foreignField: '_id',
        },
      ),
    {
      type: '1:n',
      localField: '_id',
      foreignField: 'authorId',
      as: 'postList',
    },
  )
  .lookup(userProfile.select({ avatar: true, bio: true }), {
    type: '1:1',
    localField: '_id',
    foreignField: 'userId',
    as: 'profile',
  })
  .queryOne();

assertType<{
  _id: string;
  nickname: string;
  age: number;
  sex: 'male' | 'female';
  postList: {
    _id: string;
    title: string;
    comments: {
      _id: string;
      content: string;
      likes: number;
    }[];
    tags: {
      _id: string;
      name: string;
    }[];
  }[];
  profile: {
    _id: string;
    avatar: string;
    bio: string;
  };
}>(user);

user._id.charAt(0);
user.nickname.charAt(0);
user.age.toFixed();
user.sex.toLowerCase();
user.postList[0]._id.charAt(0);
user.postList[0].title.charAt(0);
user.postList[0].comments[0].content.charAt(0);
user.postList[0].comments[0].likes.toFixed();
user.postList[0].tags[0].name.charAt(0);
user.postList[0].tags[0].createdAt.toFixed();
user.profile.avatar.charAt(0);
user.profile.bio.charAt(0);

const books = await bookTable
  .lookup(userBookTable, {
    localField: '_id',
    foreignField: 'bookId',
    type: '1:1',
    where: {
      readerId: '123',
    },
    as: 'book2',
    unselect: true,
  })
  .where({
    book2: dbQuery.size(0),
  })
  .query();
books[0]._id.charAt(0);
books[0].book2.readerId.charAt(0);
assertType<
  (Book & {
    book2: UserBook;
  })[]
>(books);

const result = await dbTransaction(async (wt) => {
  const user = await wt(userTable).select({}).queryOne();
  user.age.toFixed();
  const post = await postTable.select({}).queryOne();
  post.title.charAt(0);

  return {
    user,
    post,
  };
});
result.user.age.toFixed();
result.post.title.charAt(0);

const result2 = await dbUpsert(userTable, {
  where: {
    nickname: 'john',
    age: dbQuery.gt(18),
  },
  select: {
    age: true,
    // xxx: true,
  },
  create: {
    name: 'john',
    age: 18,
    age2: 123,
  },
  update: {
    name: 'john2',
    age: dbMutate.inc(1),
  },
  // update(exist) {
  //   return {
  //     age: exist.age + 1,
  //     age2: 1,
  //     age3: 2,
  //   };
  // },
});

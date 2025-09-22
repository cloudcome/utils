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
  metas: {
    birthday: string;
    height: number;
  };
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
    // age: true,
    _id: false,
  })
  .queryOne();
user1.age.toFixed();
user1.sex.toLowerCase();
assertType<{
  // _id: string;
  age: number;
  sex: 'male' | 'female';
  nickname: string;
}>(user1);
// user1._id.length;
user1.nickname.length;

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
    aaa: 'true',
    bbb: true,
    ccc: false,
    ddd: undefined,
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

const post3 = postTable.select({
  title: true,
  content: true,
});
const user3 = await userTable
  .where({
    _id: '1',
  })
  .select({
    nickname: true,
  })
  .lookup(
    postTable.select({
      title: true,
      content: true,
    }),
    // post3
    {
      localField: '_id',
      foreignField: 'authorId',
      type: '1:n',
      as: 'posts',
    },
  )
  .queryOne();
assertType<{
  _id: string;
  nickname: string;
  posts: {
    title: string;
    content: string;
  }[];
}>(user3);
user3._id.charAt(0);
user3.nickname.charAt(0);
const user3Post = user3.posts[0];
user3Post.content.charAt(0);
user3.posts[0].title.charAt(0);
user3.posts[0].content.charAt(0);

const user4 = await userTable
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
}>(user4);

user4._id.charAt(0);
user4.nickname.charAt(0);
user4.age.toFixed();
user4.sex.toLowerCase();
user4.postList[0]._id.charAt(0);
user4.postList[0].title.charAt(0);
user4.postList[0].comments[0].content.charAt(0);
user4.postList[0].comments[0].likes.toFixed();
user4.postList[0].tags[0].name.charAt(0);
user4.postList[0].tags[0].createdAt.toFixed();
user4.profile.avatar.charAt(0);
user4.profile.bio.charAt(0);

const books = await bookTable
  .lookup(
    userBookTable.where({
      readerId: '123',
    }),
    {
      localField: '_id',
      foreignField: 'bookId',
      type: '1:1',
      as: 'book2',
      unselect: true,
    },
  )
  .where({
    book2: dbQuery.size(0),
  })
  .query();
books[0]._id.charAt(0);
assertType<
  (Book & {
    // book2: UserBook;
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
    age: 18,
    nickname: 'john',
    sex: 'male',
    metas: {
      birthday: '1990-01-01',
      height: 180,
    },
  },
  update: {
    nickname: 'john',
    age: dbMutate.inc(1),
    metas: {
      birthday: dbMutate.set('1990-01-01'),
    },
  },
  // update(exist) {
  //   return {
  //     age: exist.age + 1,
  //     age2: 1,
  //     age3: 2,
  //   };
  // },
});

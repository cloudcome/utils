import { type DbSelect, db, dbCmd } from './db';
import { dbTransaction, dbUpsert } from './fns';

type UserSex = 'male' | 'female';
type User = {
  _id: string;
  name: string;
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

const user1 = await db.table<User>('users').select({ age: true }).select({ age: true, sex: true }).queryOne();
user1.age.toFixed();
user1.sex.toLowerCase();
assertType<{
  _id: string;
  age: number;
  sex: 'male' | 'female';
}>(user1);

const userTable = db.table<User>('user');
const userProfile = db.table<UserProfile>('profile');
const postTable = db.table<Post>('posts');
const tagTable = db.table<Tag>('tag');
const commentTable = db.table<Comment>('comment');

const user2 = await userTable
  .whereId('123')
  .select({
    _id: true,
    name: true,
    // age: true,
    // sex: true,
    // abc: 'true',
    // def: true,
    // xyz: undefined,
  })
  .queryOne();
user2._id.charAt(0);
user2.name.charAt(0);
// user2.age.toFixed();
// user2.sex.charAt(0);
// user2.def
assertType<{
  _id: string;
  name: string;
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
  name: string;
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
user.name.charAt(0);
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
    // name: 'john',
    // age: dbCmd.gt(18),
  },
  select: {
    age: true,
    xxx: true,
  },
  create: {
    name: 'john',
    age: 18,
  },
  update(exist) {
    return {
      age: exist.age + 1,
    };
  },
});

type Data = {
  aa: string;
  bb: number;
};
type Test = Record<keyof Data, boolean> & Record<string, boolean>;

function test<T extends Test>(value: T) {}

test({ aa: true, bb: true, cc: true });

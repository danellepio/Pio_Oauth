const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const keys = require('./keys');
const User = require('../models/user-model');

passport.serializeUser((user, done)=>{
    done(null, user.id); // A piece of info and save it to cookies
});

passport.deserializeUser((id, done)=>{
    //Who's id is this?
    User.query(`SELECT "oauth".findById(${id})`,(err,res)=>{
        if(err){
            console.log(err);
        }else{
            console.log(res.rows[0]);
            done(null, user); 
        }        
    });
});

passport.use(
    new GoogleStrategy({
        // options for the google strat
        callbackURL: '/auth/google/callback',
        clientID: keys.google.clientID,
        clientSecret: keys.google.clientSecret
    }, (accessToken, refreshToken, profile, done)=>{
        // check if user already exists in our database
        console.log('##########################');
        console.log(profile);

        User.query(`CALL "oauth".insert_when_unique(${profile.id},
                                                    '${profile.displayName}',
                                                    '${profile.photos[0].value}');`,
                    (err,res)=>{
                        console.log(">>>>>>>>>>>>>>>>>>>>>>");
                        const _user = {
                            id: profile.id,
                            name: profile.displayName,                                
                            picture: profile.photos[0].value
                        };

                        if(err){
                            //already have the user
                            const currentUser = _user;
                            console.log('User is ', JSON.stringify(currentUser));
                            done(null, currentUser);
                            //console.log(err);
                        }else{
                            //if not, new user was created in our db
                            const newUser = _user;
                            console.log('New User created: ' + JSON.stringify(newUser));
                            done(null, newUser);
                            // console.log(res.rows[0]);
                        }
                    });
    })
);